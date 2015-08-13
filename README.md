![](https://github.com/ahvonenj/GaleJS/blob/master/gale_logo_small.png?raw=true)

Second coming of the unpopular Apptranslator Version 1!

## Why?

There is no decent lightweight client-side translation library made for hybrid mobile applications for example. [i18next](http://i18next.com/) exists, but it is overkill for simple applications.

## What?

- Simple and fast application translation
- Translations are stored as a JSON file
- Translated element caching makes re-translating quite fast
- Get translation by translation id
- Reverse-lookup translations by text
- Data-attribute based translation id-system (means clean HTML and makes runtime attribute modifications possible)
- No heavy, extra localization features - only pure text translations

## How?

### Define to-be-translated elements in HTML

```
<h1 data-translateid = "page_main_header">Placeholder header</h1>
<p data-translateid = "page_header_subtext">Placeholder header subtext</p>
<h2 class = "left-aligned post_header" data-translateid = "post_first_header">Placeholder first subheader</h2>
```

### Create translations.json file which looks something like this

```
{
    "meta":
    {
        "availableLanguages":
        {
            "finnish":
            {
                "shorthand": "fi"   
            },
            "english":
            {
                "shorthand": "en"   
            },
            "swedish":
            {
                "shorthand": "swe"   
            }
        }
    },
    
    "translations":
    {
        "fi":
        {
            "page_main_header": "Pääotsikko",
            "page_header_subtext": "Pääotsikon alateksti",
            "post_first_header": "Ensimmäinen alaotsikko"
        },
        
        "en":
        {
            "page_main_header": "Main header",
            "page_header_subtext": "Subtext of main header",
            "post_first_header": "First subheader"
        },
        
        "swe":
        {
            "page_main_header": "Sidhuvud",
            "page_header_subtext": "Undertext av sidhuvud",
            "post_first_header": "Första delhuvudet"
        }
    }
}
```

### Include gale.js and jquery

```
<script src="jquery-1.11.3.min.js"></script>
<script src="gale.js"></script>
```

### Create new Gale-object and load the translation source into it

Here we also have a callback specified. Gale will translate the application in english after it has loaded the source.

```
var gale = new Gale();

gale.loadSourceFromJSON('translations.json', function()
{ 
    gale.translateApp('english'); 
});
```

## Demo

[Here](http://ahvonenj.github.io/GaleJS/). 
