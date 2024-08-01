import { S3Client } from "@aws-sdk/client-s3";

import downloadBucketObject from "./helpers/downloadBucketObject.js";
import listBucketObjects from "./helpers/listBucketObjects.js";
import TransferMonitor from "./helpers/transferMonitor.js";

const client = new S3Client({
  region: process.env.REGION || "eu-west-1",
  ...(process.env.ACCESS_KEY_ID && process.env.SECERT_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECERT_ACCESS_KEY,
        },
      }
    : {
        signer: {
          sign: (request) => request,
        },
      }),
});

const Bucket = process.argv.slice(2)[0].replace("s3://", "");

const monitor = new TransferMonitor();
monitor.on("progress", (progress) => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(JSON.stringify(progress));
});

const { objects, size } = await listBucketObjects(Bucket, client);

monitor.emit("metadata", size, objects.length);

await Promise.all(
  objects.map(
    async (object) => await downloadBucketObject(object, client, monitor)
  )
);

console.log(`\nSuccessful fetched s3 resouse.`);
