export const audioFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(mp3|ogg|acc|wav)$/)) {
        return callback(new Error('Only audio files are allowed!'), false);
    }
    callback(null, true);
}

export const editFileName = (req, file, callback) => {
    const extension: string = file.originalname.split('.').pop();
    const random = Array(8)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    callback(null, random + "." + extension);
};