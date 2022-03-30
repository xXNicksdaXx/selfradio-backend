export const audioFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(mp3|ogg|acc|wav)$/)) {
        return callback(new Error('Only audio files are allowed!'), false);
    }
    callback(null, true);
}