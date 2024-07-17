function orderStyle(){
    console.log("Click");
    if ( document.getElementById("order-list").classList.contains('list-style') ){
        document.getElementById("order-list").classList.remove('list-style');
    }else{
        document.getElementById("order-list").classList.add('list-style');
    }
}