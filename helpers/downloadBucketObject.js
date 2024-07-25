import fs, { promises as fsp } from "fs";
import path from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";

function toLocalPath(filePath) {
  return filePath.split(path.posix.sep).join(path.sep);
}

export default async function downloadBucketObject(
  { Bucket, Key },
  client,
  monitor
) {
  const relativePath = toLocalPath(Key);
  const filePath = path.join("temp", relativePath);
  await fsp.mkdir(path.dirname(filePath), { recursive: true });

  try {
    const result = await client.send(
      new GetObjectCommand({
        Bucket,
        Key,
      })
    );

    if (result.Body) {
      const readStream = result.Body;

      const writeStream = readStream.pipe(fs.createWriteStream(filePath));

      readStream.on("data", (data) => {
        monitor.emit("size", data.length);
      });

      await new Promise((resolve, reject) => {
        writeStream.on("error", reject);
        writeStream.on("finish", () => {
          monitor.emit("object");

          fs.utimes(
            filePath,
            result.LastModified,
            result.LastModified,
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
      });
    } else {
      throw new Error("Missing result body.");
    }
  } catch (err) {
    throw new Error(`Cannot fetch object with key: ${Key}.\n\n${err}`);
  }
}
