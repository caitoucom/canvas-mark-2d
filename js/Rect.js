class Rect{
    type = 1;
    labelText = '';
    coor = [];
    uuid = '';
    color = '';
    creating = false;
    dragging = false;
    active = false;
    constructor() {
        
    }
    get ctrlsData() {
        const [[x0, y0], [x1, y1]] = this.coor;
        return [
            [x0, y0],
            [x0 + (x1 - x0) / 2, y0],
            [x1, y0],
            [x1, y0 + (y1 - y0) / 2],
            [x1, y1],
            [x0 + (x1 - x0) / 2, y1],
            [x0, y1],
            [x0, y0 + (y1 - y0) / 2],
        ];
    }
}

export {
    Rect
}