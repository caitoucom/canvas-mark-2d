/**
 * 生成框ID
*/
export function createUuid() {
    // 生成uuid
    const s = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    const uuid = s.join('');
    return uuid;
}

/**
 * 计算再画布中的真实位置
*/
export function toCanvasPos(e, canvasEl) {
    let { top, left } = canvasEl.getBoundingClientRect()
    let cx = e.clientX
    let cy = e.clientY

    let x = cx - left
    let y = cy - top

    return { x, y }
}