var gale;

$(document).ready(function()
{
    gale = new Gale();
    gale.loadSourceFromJSON('translations.json', function()
    { 
        gale.translateApp('english'); 
        console.log(gale.getTranslationsById('post_first_content'));
        console.log(gale.reverseTranslationLookup('Third subheader'));
    });
});