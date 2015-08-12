function AppTranslator(translatableElementIdentifier)
{
    this.identifier = translatableElementIdentifier || 'translateid';
    
    this.previousLanguage = null;
    this.currentLanguage = null;
    this.nextLanguage = null;
    
    this.translationSourceLoaded = false;
    
    this.translationRawSource = null;
    this.translationSource = null;
    this.translationMeta = null;
    
    this.availableLanguages = null;
    
    return this;
}

AppTranslator.prototype.loadSourceFromJSON = function(url)
{
    var self = this;
    
    $.getJSON(url, function(data)
    {
        if(data && data.meta && data.translations)
        {
            self.translationRawSource = data;
            self.translationMeta = data.meta;
            
            if(!data.meta.availableLanguages)
            {
                console.log('Meta \'availableLanguages\' not found for JSON translation source, trying to parse directly from translations object');
                
                var availLanguages = [];

                for(var key in data.translations)
                {
                    availLanguages.push(key);   
                }
                
                if(availLanguages.length > 0)
                {
                    console.log('Parsing successful, but without availableLanguages-meta, availableLanguages will not be as exclusive');
                    self.availableLanguages = availLanguages;
                    self.translationMeta.availableLanguagesCount = availLanguages.length;
                }
                else
                {
                    console.log('Parsing failed. Is translations object empty or incorrectly structured'); 
                }
            }
            else
            {
                console.log('Meta \'availableLanguages\' found for JSON translation source, skipping translation object language parsing');   
                
                self.availableLanguages = data.meta.availableLanguages;
                self.translationMeta.availableLanguagesCount = Object.keys(data.meta.availableLanguages).length;
            }
            
            
        }
        else
        {
            throw new Error('JSON cannot be null and / or it must include meta and data objects');   
        }
        console.log(data);
        
    }).fail(function()
    {
        throw new Error('Failed to load translation source from JSON');
    });
}