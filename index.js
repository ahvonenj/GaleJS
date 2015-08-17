var gale;
var translate;

$(document).ready(function()
{
    gale = new Gale();
    
    // JSON source
    gale.loadSourceFromJSON('translations.json', function()
    { 
        gale.translateApp('english');
        console.log(gale.reverseTranslationLookup('This is second translated content text'));
        console.log(gale._invertSource());
    });
    
    // Object source
    /*gale.loadSourceFromObject(translation_obj, function()
    { 
        gale.translateApp('english');
        console.log(gale.reverseTranslationLookup('This is second translated content text'));
        console.log(gale._invertSource());
    });*/
    
    $('.translate_button').on('click', function()
    {
        gale.translateApp($(this).data('translateto'), $('#from_cache').is(':checked')); 
    });
});
