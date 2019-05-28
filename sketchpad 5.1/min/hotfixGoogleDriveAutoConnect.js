// See https://github.com/SketchIO/sketch-api/issues/1042 for more info
function hotfixGoogleDriveAutoConnect() {
	var hasGoogleDriveToken = localStorage.getItem('sk/fs.gdrive.accessToken');
	if(!hasGoogleDriveToken) {
		localStorage.setItem('sk/app.driveFileService.autoConnect', false);
	}
}

hotfixGoogleDriveAutoConnect();
