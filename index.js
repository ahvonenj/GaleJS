var gale;
var translate;

$(document).ready(function()
{
    gale = new Gale();
    gale.loadSourceFromJSON('translations.json', function()
    { 
        gale.translateApp('english');
        gale.reverseTranslationLookup('This is second translated content text');
    });
    
    $('.translate_button').on('click', function()
    {
        gale.translateApp($(this).data('translateto'), $('#from_cache').is(':checked')); 
    });
});
