let lensType = 'CONVERGENTE'; // 'CONVERGENTE' o 'DIVERGENTE'
let f = 120; // Distancia focal en píxeles
let objX = -200; // Posición X del objeto (relativa al centro)
let objH = -80;  // Altura del objeto (negativo es hacia arriba en p5)
let dragging = false; // Estado para arrastrar

function setup() {
    let canvas = createCanvas(800, 500);
    canvas.parent('canvas-container');
    textSize(14);
}

function draw() {
    background(255);
    
    // Mover el origen (0,0) al centro del canvas
    translate(width / 2, height / 2);
    
    // --- Lógica Física ---
    // Ajuste de signo: Convergente f > 0, Divergente f < 0.
    let focalLen = (lensType === 'CONVERGENTE') ? f : -f;
    
    // Ecuación de lentes: 1/f = 1/do + 1/di
    // Despejando distancia imagen (di): di = (f * do) / (do - f)
    // Nota: En coordenadas p5, 'do' es negativo (izquierda). La fórmula se adapta:
    // x_imagen = (f * x_objeto) / (x_objeto + f)
    let imgX = (focalLen * objX) / (objX + focalLen);
    
    // Magnificación: m = -di/do (o simplemente x_img / x_obj en este sistema)
    let m = imgX / objX;
    let imgH = objH * m;

    // --- Dibujado ---
    drawGrid();
    drawAxis();
    drawLensShape();
    drawFocalPoints(focalLen);
    
    // Dibujar Objeto (Rojo)
    drawObject(objX, objH, 'Objeto', [220, 50, 50]); 
    
    // Dibujar Imagen (Azul)
    // Si la imagen se forma del mismo lado que la luz entrante (virtual), la hacemos transparente
    let isVirtual = (imgX < 0); 
    drawObject(imgX, imgH, isVirtual ? 'Imagen Virtual' : 'Imagen Real', [50, 100, 220], isVirtual);

    // Dibujar Rayos
    drawRays(objX, objH, imgX, imgH, focalLen);

    // Manejo del mouse
    handleInput();
}

// --- Funciones Auxiliares de Dibujo ---

function drawGrid() {
    stroke(240);
    strokeWeight(1);
    for (let x = -width/2; x < width/2; x += 40) line(x, -height/2, x, height/2);
    for (let y = -height/2; y < height/2; y += 40) line(-width/2, y, width/2, y);
}

function drawAxis() {
    stroke(100);
    strokeWeight(1);
    line(-width/2, 0, width/2, 0); // Eje Principal
    stroke(180);
    line(0, -height/2, 0, height/2); // Eje de la Lente
}

function drawLensShape() {
    noFill();
    stroke(0, 100, 255);
    strokeWeight(3);
    
    if (lensType === 'CONVERGENTE') {
        // Forma biconvexa ()
        arc(0, 0, 60, 300, PI + HALF_PI, HALF_PI);
        arc(0, 0, 60, 300, HALF_PI, PI + HALF_PI);
        
        fill(0, 100, 255);
        noStroke();
        textAlign(CENTER);
        text("Lente Convergente", 0, -160);
    } else {
        // Forma bicóncava )(
        strokeCap(SQUARE);
        line(0, -140, 0, 140); // Guía central
        
        noFill();
        stroke(0, 100, 255);
        // Lado izquierdo
        beginShape();
        vertex(-25, -140);
        bezierVertex(5, -60, 5, 60, -25, 140);
        endShape();
        // Lado derecho
        beginShape();
        vertex(25, -140);
        bezierVertex(-5, -60, -5, 60, 25, 140);
        endShape();
        // Tapas
        line(-25, -140, 25, -140);
        line(-25, 140, 25, 140);

        fill(0, 100, 255);
        noStroke();
        textAlign(CENTER);
        text("Lente Divergente", 0, -160);
    }
}

function drawFocalPoints(fl) {
    fill(0);
    noStroke();
    
    // Foco objeto y foco imagen
    circle(fl, 0, 8);
    text("F", fl, 20);
    
    circle(-fl, 0, 8);
    text("F'", -fl, 20);
}

function drawObject(x, h, labelText, col, isGhost = false) {
    stroke(col);
    strokeWeight(3);
    fill(col);
    
    if (isGhost) {
        // Estilo fantasma para imágenes virtuales
        drawingContext.setLineDash([5, 5]); 
        fill(col[0], col[1], col[2], 100); // Relleno transparente
    } else {
        drawingContext.setLineDash([]);
    }

    line(x, 0, x, h);
    
    // Flecha
    let dir = (h < 0) ? -1 : 1;
    let arrowSize = 10;
    triangle(x - 5, h, x + 5, h, x, h + (dir * -10));
    
    noStroke();
    drawingContext.setLineDash([]);
    textAlign(CENTER);
    text(labelText, x, h + (dir * -20));
}

function drawRays(ox, oy, ix, iy, focal) {
    strokeWeight(2);
    
    let cPara = color(255, 165, 0, 200); // Naranja
    let cCent = color(0, 200, 100, 200); // Verde
    let cFoc  = color(150, 0, 200, 200); // Morado
    
    // Función para trazar línea con posible proyección virtual
    function trace(x1, y1, lensY, x2, y2, col) {
        stroke(col);
        
        // 1. Rayo incidente (hasta la lente)
        drawingContext.setLineDash([]);
        line(x1, y1, 0, lensY);
        
        // 2. Rayo refractado y proyección
        // Calculamos pendiente m = (y2 - lensY) / (x2 - 0)
        let slope = (y2 - lensY) / (x2);
        
        // Extender a la derecha (mundo real)
        let farX = width;
        let farY = lensY + slope * farX;
        drawingContext.setLineDash([]);
        line(0, lensY, farX, farY);
        
        // Extender a la izquierda (proyección virtual)
        // Solo necesario si la imagen es virtual o divergente para ver de dónde viene
        let backX = -width;
        let backY = lensY + slope * backX;
        
        stroke(col.levels[0], col.levels[1], col.levels[2], 80); // Color más suave
        drawingContext.setLineDash([5, 5]);
        line(0, lensY, backX, backY);
    }

    // 1. Rayo Paralelo: Entra recto, sale hacia el foco (o desde el foco)
    // Llega a la lente a la altura del objeto
    trace(ox, oy, oy, ix, iy, cPara);
    
    // 2. Rayo Central: Pasa por (0,0) sin desviarse
    trace(ox, oy, 0, ix, iy, cCent);
    
    // 3. Rayo Focal: Pasa por el foco, sale paralelo
    // Llega a la lente a la altura de la IMAGEN
    trace(ox, oy, iy, ix, iy, cFoc);
    
    drawingContext.setLineDash([]); // Reset
}

function handleInput() {
    // Distancia del mouse a la punta del objeto
    let mx = mouseX - width/2;
    let my = mouseY - height/2;
    let d = dist(mx, my, objX, objH);
    
    // Cursor
    if (d < 30) cursor(MOVE);
    else cursor(ARROW);

    if (mouseIsPressed && d < 40) {
        dragging = true;
    }
    if (!mouseIsPressed) {
        dragging = false;
    }
    
    if (dragging) {
        // Limitar posición X para que no cruce la lente (x < -10)
        objX = min(mx, -10);
        objH = my;
    }
}

// Botón HTML llama a esta función
function toggleLens() {
    let btn = document.getElementById('lensBtn');
    if (lensType === 'CONVERGENTE') {
        lensType = 'DIVERGENTE';
        btn.innerText = "Cambiar a Lente Convergente";
    } else {
        lensType = 'CONVERGENTE';
        btn.innerText = "Cambiar a Lente Divergente";
    }
}
