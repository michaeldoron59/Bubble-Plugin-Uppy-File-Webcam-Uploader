
function(instance, context) {
instance.data.divName = "id"+Math.round(Math.random()*1000000) + 1
instance.canvas.innerHTML = `<div id="${instance.data.divName}"></div>`  
}
