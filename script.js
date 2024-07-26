function inlineSVG(imgElement, color) {
    var imgClass = imgElement.width
    var imgURL = imgElement.src;
    
    console.log(imgClass)

    fetch(imgURL)
        .then(response => response.text())
        .then(svgText => {
            var parser = new DOMParser();
            var svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            var svgElement = svgDoc.querySelector('svg');
            
            
            svgElement.style.fill = color;
            svgElement.width = imgClass
            imgElement.parentNode.replaceChild(svgElement, imgElement);
        })
        .catch(error => console.error('Error fetching SVG:', error));
}


// document.addEventListener('DOMContentLoaded', function() {
//     var imgElement = document.getElementById('likedIcon');
//     var newColor = 'red';
//     // inlineSVG(imgElement, newColor);


    
// });


// $( "#includedContent" ).load( "pages/shop/shop_screen.html", function() {
//     alert( "Load was performed." );
//   });



var state = "catalog"
$( "#head" ).load( "/pages/product/product_screen.html #head");
$( "#includeProduct" ).load( "/pages/product/product_screen.html #container");
// $( "#head" ).load( "/pages/shop/shop_screen.html #head");
// $( "#includedContent" ).load( "/pages/shop/shop_screen.html #container");
// $( ".footer-item" ).removeClass( "select-footer" );
// $( "#footerCatalog" ).addClass( "select-footer" );



$( "#catalog" ).on( "click", function() {
    if(state != "catalog"){
        $( ".footer-item" ).removeClass( "select-footer" );
        $( "#footerCatalog" ).addClass( "select-footer" );

        $( "#head" ).empty();
        $( "#includedContent" ).empty();
        $( "#head" ).load( "/pages/shop/shop_screen.html #head");
        $( "#includedContent" ).load( "/pages/shop/shop_screen.html #container");
        
        state = "catalog"
    }
    
});



$( "#favorite" ).on( "click", function() {
    if(state != "favorite"){
        $( ".footer-item" ).removeClass( "select-footer" );
        $( "#footerFavorite" ).addClass( "select-footer" );
        $( "#head" ).empty();
        $( "#includedContent" ).empty();
        $( "#head" ).load( "/pages/wishlist/wishlisy_screen.html #head");
        $( "#includedContent" ).load( "/pages/wishlist/wishlisy_screen.html #container");
        
        state = "favorite"
    }
  } );


$( "#bag" ).on( "click", function() {
    if(state != "bag"){
        $( ".footer-item" ).removeClass( "select-footer" );
        $( "#footerBag" ).addClass( "select-footer" );
        $( "#head" ).empty();
        $( "#includedContent" ).empty();
        $( "#head" ).load( "/pages/shopping/shoppingbag_screen.html #head");
        $( "#includedContent" ).load( "/pages/shopping/shoppingbag_screen.html #container");
        
        state = "bag"
    }
  } );


function initSlidePanel(){
    document.addEventListener('touchend', endTouch, false);   
    document.addEventListener('touchstart', startTouch, false);         
    document.addEventListener('touchmove', handleTouchMove, false);

    const productCont = document.getElementById('includeProduct')
    productCont.style.transition = 'transform .1s';
                                                            
    var yDown = null;
    var initY =null
    var sectionScreen = null
    var yDiff = null

    function startTouch(e) {
        yDown = e.touches[0].clientY;
        initY = getTranslateY(productCont)  
        

    };     
    function endTouch(e) {
        
        sectionScreen = (($( window ).height()/Math.abs(initY-yDiff))*10)
        console.log("end " +sectionScreen)
        if (sectionScreen < 20){
            productCont.style.transform = `translateY(${$( window ).height()}px)`; 
        }
        yDown = null
    };  
    function getTranslateY(element) {
        const style = window.getComputedStyle(element);
        const transform = style.transform;
        if (transform === 'none') {
            return 0;
        }
        const matrix = transform.match(/^matrix\((.+)\)$/);
        if (matrix) {
            const values = matrix[1].split(', ');
            return parseFloat(values[5]);
        }
        
        const translateY = transform.match(/translateY\(([^)]+)\)/);
        if (translateY) {
            return parseFloat(translateY[1]);
        }
        
        const translate = transform.match(/translate\(([^)]+)\)/);
        if (translate) {
            const values = translate[1].split(', ');
            return parseFloat(values[1] || 0);
        }
        return 0;
    }                                        

 

    function handleTouchMove(evt) {
        if (! yDown ) {
            return;
        }                                   
        var yUp = evt.touches[0].clientY;
        yDiff = yDown - yUp;
        
        var cord = initY-yDiff
        if(cord > 0){
            if ( yDiff > 0 ) {
                productCont.style.transform = `translateY(${cord}px)`;
                
            } else {  
                productCont.style.transform = `translateY(${cord}px)`;   
            } 
        }
                                                    
    };
}



initSlidePanel()