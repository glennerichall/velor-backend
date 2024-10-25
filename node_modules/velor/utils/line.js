// import earcut from 'earcut';
// import polygonClipping from 'polygon-clipping';

export function length(x, y) {
    return Math.sqrt(x * x + y * y);
}

export function distance(p1, p2) {
    return length(p1.x - p2.x, p1.y - p2.y);
}

export function normalize(ax, ay, bx, by) {
    let dx = bx - ax;
    let dy = by - ay;
    let l = length(dx, dy);
    return [dx / l, dy / l];
}

export function intersection(p1, u, p2, v) {
    let ux = u.x;
    let uy = u.y;

    let vx = v.x;
    let vy = v.y;

    let p1x = p1.x;
    let p1y = p1.y;

    let p2x = p2.x;
    let p2y = p2.y;

    let b = ux * (p2y - p1y) - uy * (p2x - p1x);
    let cross = uy * vx - ux * vy;

    // 0 => lines are parallel
    const eps = 0.000000000001;
    if (Math.abs(cross) < eps) {
        return false;
    }
    b = b / cross;

    let a = b * vx + p2x - p1x;
    a = a / ux;

    let x = b * vx + p2.x;
    let y = b * vy + p2.y;

    return {x, y, a, b};
}

export function bevel(anchor) {
    let {a, b} = anchor;
    let pa1 = a.points[0];
    let pb1 = b.points[3];

    let u = {...a.u};
    let v = {...b.u};

    v.x = -v.x;
    v.y = -v.y;

    let pa2 = a.points[1];
    let pb2 = b.points[2];

    let p1 = intersection(pa1, u, pb1, v);
    let p2 = intersection(pa2, u, pb2, v);
    if (!p1 || !p2) {
        return [];
    }

    function calcS(p1, p2, s) {
        let l = distance(p1, p2);
        s = s / l;
        if (s <= 1 && s >= 0) {
            s = 0;
        } else {
            s = Math.abs(s) / s;
        }
        return s;
    }

    let s = calcS(a.points[0], a.points[3], p1.a)

    let mid = {
        x: (a.points[3].x + a.points[2].x) / 2,
        y: (a.points[3].y + a.points[2].y) / 2
    }
    if (s !== 1) {
        return [{
            points: [
                mid,
                a.points[2],
                b.points[1]
            ]
        }];
    } else {
        return [{
            points: [
                a.points[3],
                mid,
                b.points[0]
            ]
        }];
    }
}

export function extrudeLine(line, width) {
    let ax = line.a.x;
    let ay = line.a.y;

    let bx = line.b.x;
    let by = line.b.y;

    let [ux, uy] = normalize(ax, ay, bx, by);

    let Ux = uy;
    let Uy = -ux;

    // width = width / 2;
    let p1x = ax + width * Ux;
    let p1y = ay + width * Uy;

    let p2x = ax - width * Ux;
    let p2y = ay - width * Uy;

    let p3x = bx - width * Ux;
    let p3y = by - width * Uy;

    let p4x = bx + width * Ux;
    let p4y = by + width * Uy;

    return {
        points: [
            {x: p1x, y: p1y},
            {x: p2x, y: p2y},
            {x: p3x, y: p3y},
            {x: p4x, y: p4y}
        ],
        u: {x: ux, y: uy},
        U: {x: Ux, y: Uy}
    }
}

export function extrudePolyline(points, width) {
    const faces = [];
    for (let i = 1; i < points.length; i++) {
        let a = points[i - 1];
        let b = points[i];
        let face = extrudeLine({a, b}, width);
        faces.push(face);
    }
    return faces;
}

export function bevelFaces(faces) {
    let lineJoin = [faces[0]];
    for (let i = 1; i < faces.length; i++) {
        let a = faces[i - 1];
        let b = faces[i];
        let jfaces = bevel({a, b});
        lineJoin.push(...jfaces, b);
    }
    return lineJoin;
}

export function translateFace(face, {x = 0, y = 0, z = 0} = {x: 0, y: 0, z: 0}) {
    let {points} = face;
    for (let i = 0; i < face.points.length; i++) {
        points[i] = {x, y, z, ...points[i]};
        points[i].x += x;
        points[i].y += y;
        points[i].z += z;
    }
    return face;
}

export function union(faces) {
    faces = faces.map(face =>
        [face.points.map(
            point => [point.x, point.y])]);
    return polygonClipping.union(...faces)[0][0];
}

export function tessellate(polyline, width, height, z) {
    let n = polyline.points.length - 1;

    // union will create a single polygon from looping lines
    if (polyline.points[0].x === polyline.points[n].x &&
        polyline.points[0].y === polyline.points[n].y) {
        polyline.points[n].y -= width
        polyline.points[n].x -= width
    }
    polyline = inflate(polyline, width);
    //
    let {vertices: flat} = earcut.flatten([polyline]);
    const indices = earcut(flat);
    let vertices = [];
    for (let i = 0; i < indices.length; i++) {
        vertices[i * 3 + 0] = polyline[indices[i]][0];
        vertices[i * 3 + 1] = polyline[indices[i]][1];
        vertices[i * 3 + 2] = z;
    }
    const bottom = [...vertices];

    for (let i = 2; i < bottom.length; i += 3) {
        bottom[i] -= height;
    }

    for (let i = 0; i < bottom.length; i += 9) {
        let x = bottom[i + 3];
        let y = bottom[i + 4];
        let z = bottom[i + 5];
        bottom[i + 3] = bottom[i + 3 + 3];
        bottom[i + 4] = bottom[i + 4 + 3];
        bottom[i + 5] = bottom[i + 5 + 3];
        bottom[i + 3 + 3] = x;
        bottom[i + 4 + 3] = y;
        bottom[i + 5 + 3] = z;

    }

    for (let i = 0; i < polyline.length - 1; i++) {
        let pts = new Array(18);
        pts[0] = polyline[i][0];
        pts[1] = polyline[i][1];
        pts[2] = z;

        pts[3] = polyline[i][0];
        pts[4] = polyline[i][1];
        pts[5] = z - height;

        pts[6] = polyline[i + 1][0];
        pts[7] = polyline[i + 1][1];
        pts[8] = z - height;

        pts[9] = polyline[i][0];
        pts[10] = polyline[i][1];
        pts[11] = z;

        pts[12] = polyline[i + 1][0];
        pts[13] = polyline[i + 1][1];
        pts[14] = z - height;

        pts[15] = polyline[i + 1][0];
        pts[16] = polyline[i + 1][1];
        pts[17] = z;

        vertices.push(...pts);
    }

    vertices.push(...bottom);
    return vertices;
}

export function inflate(polyline, width) {
    let faces = extrudePolyline(polyline, width);
    faces = bevelFaces(faces);
    return union(faces);

}