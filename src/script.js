const docWorld = document.querySelector('.world');
const docInfo = document.querySelector(".info");
const docEdgeList = document.querySelector(".edgeList");

var edges = [];
var adj = [];
var snode = null;
var dnode = null;
var startNode = null;
var endNode = null;
var se = false;
var bi = true;

const svgContainer = document.querySelector('svg')

const biCheck = document.querySelector('#biCheck');
const selectSe = document.querySelector('#selectSe');
const btnDij = document.querySelector('#btnDij');
const insec = document.querySelector('#insec');

function setBi() {
    bi = !bi;
}

function setMsg(m) {
    msg = "<i>Selected:</i> " + (snode !== null ? snode.id : null) + "<br><i>Destination:</i> " + (dnode !== null ? dnode.id : null) + "<br><br>";
    msg += "<i>Start:</i> " + (startNode !== null ? startNode.id : null) + "<br><i>End:</i> " + (endNode !== null ? endNode.id : null) + "<br><br>";
    docInfo.innerHTML = msg;
    docInfo.appendChild(insec);

    if (m) docInfo.innerHTML += "<br> 🛈 " + m;
}

function addEdge() {
    setMsg("DESTINATION SELECTED");
    if (snode === null || dnode === null) {
        setMsg("INVALID");
        return;
    }
    else if (snode === dnode) {
        setMsg("SRC DST CANNOT BE SAME");
        return;
    }
    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i];
        if (edge[0] === snode && edge[1] === dnode) {
            setMsg("EDGE ALREADY EXISTS");
            return;
        }
    }
    setMsg("EDGE ADDED");
    edges.push([snode, dnode]);
    let u = parseInt(snode.id.slice(4));
    let v = parseInt(dnode.id.slice(4));
    if (adj[u] === undefined) adj[u] = [];
    if (adj[v] === undefined) adj[v] = [];
    adj[u].push([v, 0]);
    if (bi) {
        adj[v].push([u, 0]);
        edges.push([dnode, snode]);
    }

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    let elsx = snode.offsetLeft + 10;
    let elsy = snode.offsetTop + 10;
    let eldx = dnode.offsetLeft + 10;
    let eldy = dnode.offsetTop + 10;
    line.setAttribute("x1", (elsx));
    line.setAttribute("y1", (elsy));
    line.setAttribute("x2", (eldx));
    line.setAttribute("y2", (eldy));
    line.setAttribute("stroke", "black");
    line.setAttribute("marker-end", "url(#endarrowhead)");
    line.style.cursor = "crosshair";
    if (bi) {
        line.setAttribute("marker-start", "url(#startarrowhead)");
        line.classList.add("bi");
    }
    svgContainer.appendChild(line);

    const cost = document.createElementNS("http://www.w3.org/2000/svg", "text");
    cost.setAttribute("x", (elsx + eldx) / 2);
    cost.setAttribute("y", (elsy + eldy) / 2);
    cost.setAttribute("dominant-baseline", "middle");
    cost.classList.add("cost");
    cost.id = "edge" + snode.id.slice(4) + '-' + dnode.id.slice(4);
    cost.innerHTML = "0";
    if (bi) cost.classList.add("bi");
    svgContainer.appendChild(cost);
    docEdgeList.innerHTML += edges[edges.length - 1][0].id + (bi ? " ⇌ " : " ➔ ") + edges[edges.length - 1][1].id + "<br>";
}

setMsg(snode, dnode);

docWorld.addEventListener('click', function (e) {
    let pt = e.target;
    let cnode = undefined;
    if (pt.classList.contains('cost')) {
        handleCostClick(e);
        return;
    }
    else if (pt.classList.contains('vertex') && se === true) {
        handleSe(pt);
        return;
    }
    handleVertexClick(e);

});

function selectStartEnd() {
    if (startNode != null && endNode != null) {
        startNode.classList.remove('colorEdgeBegin');
        endNode.classList.remove('colorEdge');
        startNode = null;
        endNode = null;
    }
    se = !se;
}

function handleSe(pt) {
    if (startNode === null) {
        startNode = pt;
        startNode.classList.add('colorEdgeBegin')
        setMsg("START SELECTED <br>(now select END)")
    }
    else if (endNode === null) {
        endNode = pt;
        endNode.classList.add('colorEdge')
        setMsg("END SELECTED")
        se = false;
    }
}

function editCost(u, v, cost) {
    for (let i = 0; i < adj[u].length; i++) {
        if (adj[u][i][0] == v) {
            adj[u][i][1] = cost;
            return;
        }
    }
}

function handleCostClick(e) {
    let pt = e.target;
    let cost = prompt("Enter Cost", 0);
    if (cost === null) return;
    let vs = pt.id.slice(4).split("-");
    let u = parseInt(vs[0]);
    let v = parseInt(vs[1]);
    cost = parseInt(cost);
    editCost(u, v, cost);
    if (pt.classList.contains('bi')) editCost(v, u, cost);
    pt.innerHTML = cost;
}

function handleVertexClick(e) {
    var cnode = undefined;
    if (e.target.classList.contains('vertex')) cnode = e.target;
    if (snode === null) {
        snode = cnode || addVertex(e);
        setMsg("SOURCE SELECTED");
        dnode = null;
    }
    else {
        dnode = cnode || addVertex(e);
        addEdge();
        snode = null;
        dnode = null;
    }
}

function addVertex(e) {
    const V = document.createElement('div');
    V.classList.add('vertex');
    V.style.top = e.pageY - docWorld.offsetTop - 16 + 'px';
    V.style.left = e.pageX - docWorld.offsetLeft - 16 + 'px';
    V.id = "node" + adj.length;
    V.innerHTML = adj.length;
    docWorld.appendChild(V);
    if (adj[adj.length] === undefined) adj[adj.length] = [];
    return V;
}


function colorEdge(u, v) {
    let edge = document.getElementById("edge" + u + '-' + v);
    if (edge === null) edge = document.getElementById("edge" + v + '-' + u);
    if (edge === null) return;   // While testing, edge not exist
    edge.style.stroke = "red";
}

function getEdgeOfVertices(u, v) {
    let edge = 'edge' + u + '-' + v;
    if (document.getElementById(edge) == null) {
        edge = 'edge' + v + '-' + u;
    }
    return document.getElementById(edge);
}

function removeColorOfEdges() {
    for (let edgeuv of edges) {
        let u = edgeuv[0].id.slice(4);
        let v = edgeuv[1].id.slice(4);
        let edge = getEdgeOfVertices(u, v);
        edge.classList.remove('colorEdge');
        edge.style.stroke = "black";
    }
}

function fillRandomCost() {
    for (let edgeuv of edges) {
        let u = edgeuv[0].id.slice(4);
        let v = edgeuv[1].id.slice(4);
        let cost = Math.floor(Math.random() * 100);
        let edge = getEdgeOfVertices(u, v);
        if (edge === null) continue;
        edge.innerHTML = cost;
        if (edge.classList.contains('bi')) {
            console.log("bi");
            editCost(v, u, cost);
        }
        editCost(u, v, cost);
    }
}

class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    push(priority, value) {
        this.queue.push([priority, value]);
        this.queue.sort((a, b) => a[0] - b[0]);
    }

    pop() {
        return this.queue.shift();
    }

    empty() {
        return this.queue.length === 0;
    }
}

function startDij() {
    removeColorOfEdges();

    const pq = new PriorityQueue();
    const dist = new Array(adj.length).fill(Number.MAX_SAFE_INTEGER);
    const parent = new Array(adj.length).fill(-1);

    if (startNode == null) {
        start = 0;
        end = dist.length - 1;
        console.info("Start End not set, setting to ", start, end);
    } else {
        start = parseInt(startNode.id.slice(4)) || 0;
        end = parseInt(endNode.id.slice(4)) || 10;
    }

    dist[start] = 0;
    pq.push(0, start);

    console.log({ adj: adj });

    while (!pq.empty()) {
        const [_, u] = pq.pop();
        for (const [v, w] of adj[u]) {
            if (dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                pq.push(dist[v], v);
            }
        }
    }
    let path = [];
    let x = end;
    while (x != -1) {
        path.push(x);
        colorEdge(parent[x], x);
        x = parent[x];
    }

    console.log(dist);
    setMsg("SHORTEST PATH from " + start + " to " + end + "=<b>" +
        dist[end] + "</b><br><b>" + path.reverse().join(" ➔ ") + "</b>");

}

// start = 0;
// end = 4;
// adj = [
//     [[1,5],[2,7]],
//     [[0,5],[2,6],[3,3]],
//     [[0,7],[1,6],[4,9]],
//     [[1,3],[4,2]],
//     [[2,9],[3,2]]
// ]
// startDij();
