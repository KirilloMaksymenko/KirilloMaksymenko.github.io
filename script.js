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
$( "#head" ).load( "/pages/shop/shop_screen.html #head");
$( "#includedContent" ).load( "/pages/shop/shop_screen.html #container");
$( ".footer-item" ).removeClass( "select-footer" );
$( "#footerCatalog" ).addClass( "select-footer" );









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


