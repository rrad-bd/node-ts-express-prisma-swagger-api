const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
export let isValidObjectId = function (text: string) {
    return checkForHexRegExp.test(text);
}

module.exports = {
    isValidObjectId,
}