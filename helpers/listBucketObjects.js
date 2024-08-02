import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export default async function listBucketObjects(bucket, prefix, client) {
  const objects = [];
  let size = 0;
  let firstRun = true;
  let continuationToken;

  try {
    while (firstRun || continuationToken !== undefined) {
      firstRun = false;

      const result = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      );

      continuationToken = result.ContinuationToken;

      if (result.Contents !== undefined) {
        result.Contents.forEach(({ Key, LastModified, Size }) => {
          if (!Key.endsWith("/") && Size > 0) {
            objects.push({
              Bucket: bucket,
              LastModified,
              Size,
              Key,
            });

            size += Size;
          }
        });
      }
    }
  } catch (err) {
    throw new Error(`Failed to fetch bucket objects\n\n${err}`);
  }

  return { objects, size };
}
