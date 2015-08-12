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

AppTranslator.prototype.loadSourceFromJSON = function(url, callback)
{
    var self = this;
    self.translationSourceLoaded = false; // Should this be set to false?
    
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
            
            self.translationSource = data.translations;
            self.translationSourceLoaded = true;
            
            callback.call(self);
        }
        else
        {
            self.translationSourceLoaded = false;
            throw new Error('JSON cannot be null and / or it must include meta and data objects');   
        }     
    }).fail(function()
    {
        self.translationSourceLoaded = false;
        throw new Error('Failed to load translation source from JSON');
    });
}

AppTranslator.prototype.translateApp = function(language)
{
    var self = this;
    
    if(!self.translationSourceLoaded)
    {
        throw new Error('Could not translate, translation source is not loaded!');
        return;
    }
    
    var isShorthand = null;
    
    
    if(self._figureSuppliedLanguage(language) == 'normal')
    {
        console.log('Normal: ' + language);
        console.log('Short: ' + self._normalToShorthand(language));
    }
    else if(self._figureSuppliedLanguage(language) == 'shorthand')
    {
        console.log('Short: ' + language);
        console.log('normal: ' + self._shorthandToNormal(language));
    }
    
    
    $('*').each(function(index, value)
    {
        var $this = $(this);
        
        if(typeof $this.data(self.identifier) === 'undefined' ||
           !$this.data(self.identifier) ||
           $.isEmptyObject($this.data(self.identifier)))
        {
            console.log('Skipped ' + $this[0].tagName);
            return;   
        }
        
        
        
        console.log($this.data(self.identifier));
    });
}

AppTranslator.prototype._figureSuppliedLanguage = function(language)
{
    var self = this;
    
    
    var suppliedLanguage = null;
    var tmpLanguages = [];
    
    for(var key in self.translationSource)
    {
        tmpLanguages.push(key);   
    }
    
    if(Array.isArray(self.availableLanguages))
    {
        for(var i = 0; i < self.availableLanguages.length; i++)
        {
            if(self.availableLanguages[i] == language)
            {
                suppliedLanguage = 'other'; // Other, but working so continue
            }
        }
    }
    else
    {
        for(var key in self.availableLanguages)
        {
            if(key == language)
            {
                suppliedLanguage = 'normal'; // Normal, long format
            }
            else if(self.availableLanguages[key].shorthand == language)
            {
                suppliedLanguage = 'shorthand'; // Shorthand
            }
        }
    }
    
    if(!suppliedLanguage)
    {
        throw new Error('Could not figure supplied \'TO-language\'');
    }
    
    return suppliedLanguage;
}

AppTranslator.prototype._normalToShorthand = function(normal)
{
    var self = this;
    
    return self.availableLanguages[normal].shorthand || null; 
}

AppTranslator.prototype._shorthandToNormal = function(shorthand)
{
    var self = this;
    
    for(var key in self.availableLanguages)
    {
        if(self.availableLanguages[key].shorthand == shorthand)
        {
            return key;
        }
    }
    
    return null;
}