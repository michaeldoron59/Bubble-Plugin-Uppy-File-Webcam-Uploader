async function(properties, context) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
	const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
  // Configure the S3 client with specific credentials and endpoint
  	const s3Client = new S3Client({
      region: properties.region, 
      credentials: {
        accessKeyId: properties.s3_access_key_id, 
        secretAccessKey: properties.s3_secret_access_key
      },
      endpoint: properties.endpoint,
    });
    
    async function sign(name) {
        const command = new PutObjectCommand({
                                              Bucket: properties.bucket,
                                              Key: properties.prefix + name
                                            });

        let preSignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: properties.signature_expiration_time // URL expires in 1 hour
        });
        
        return preSignedUrl
    }
    
    return {signedUrls: await Promise.all(properties.names._pointer.map(sign)), 
            cf_endpoint: properties.cloudflare_worker_endpoint};
}