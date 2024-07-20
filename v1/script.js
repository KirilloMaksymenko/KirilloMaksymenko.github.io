function orderStyle(){
    console.log("Click");
    if ( document.getElementById("order-list").classList.contains('list-style') ){
        document.getElementById("order-list").classList.remove('list-style');
        document.getElementById("img-format").src = "/icons/list.svg"
    }else{
        document.getElementById("order-list").classList.add('list-style');
        document.getElementById("img-format").src = "/icons/grid.svg"
    }
}
function hide(){
    console.log("Click");
    document.getElementById("card-block").hidden = true;
}
function show(){
    console.log("Click");
    document.getElementById("card-block").hidden = false;
}

