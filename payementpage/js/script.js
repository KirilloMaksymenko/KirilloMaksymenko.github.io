
var cartNumber = []
document.getElementById("numinput").addEventListener("input",(e)=>{
    e.target.value=e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
})


document.getElementById("cartnumber").addEventListener("input",(e)=>{
    e.target.value=e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    cartNumber=e.target.value.match(/.{1,4}/g)
    console.log(cartNumber)
    if(cartNumber == null) document.getElementById("cartnumberlabel").textContent =" "
    document.getElementById("cartnumberlabel").textContent = cartNumber.join('  ')
})


