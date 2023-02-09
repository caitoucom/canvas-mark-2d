class Polygon{
    type = 2;
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
        return this.coor.length > 1 ? this.coor : [];
    }
}

export {
    Polygon
}