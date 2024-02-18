function(instance, properties, context) {
    const p = properties;
	var uppy = instance.data.uppy;
    let count = 0;    
    const signedUrls = p.signedUrls.get(0,p.signedUrls.length());
    console.log("signedUrls", signedUrls)
	const files = uppy.getFiles();
	const cfe = p.cf_endpoint;
    
    instance.data.fileCount = 0;
    instance.data.allFileURLs = [];
    
    const mapping = Object.fromEntries(files.map((file,i)=>[file.id, {file: file, url:signedUrls[i]}]));
    
    uppy.use(Uppy.AwsS3, {
            fields: [], // empty array
            limit: 3,
            timeout: 3600_000,
            getUploadParameters(file) {
        		const signedUrl = mapping[file.id].url;
        		let url = cfe? cfe:signedUrl;
        		let headers = cfe? {signedurl:signedUrl}:{};
              	instance.data.publishFileStates(file);
		        instance.triggerEvent('file_upload_ready');
                return {
                            method: "PUT", // here we send method, url, fields and headers to the AWS S3 bucket
                            url: url,
                            fields: [],
                            headers: { ...headers,
                                        "Content-Type": file.type,
                                     }
                        }
        }
    });
    uppy.on("upload-success", (file, data) => {
        const signedUrl = new URL(mapping[file.id].url);
        signedUrl.search = ""
        instance.data.publishFileStates(file);
        instance.data.allFileURLs.push(downloadURL.toString());
        instance.publishState('current_file_url', downloadURL.toString());
        instance.publishState('all_file_urls', instance.data.allFileURLs);
    });
    
    
	uppy.upload().then((result)=>instance.triggerEvent('upload_session_complete'))
}