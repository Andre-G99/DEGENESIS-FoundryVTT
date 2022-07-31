import {DEGENESIS} from "../config.js"

export default function () {

    Hooks.on("init", () => {
        Handlebars.registerHelper("ifIsGM", function (options) {
            return game.user.isGM ? options.fn(this) : options.inverse(this)
        })


        Handlebars.registerHelper("isGM", function (options) {
            return game.user.isGM
        })


        Handlebars.registerHelper("config", function (key) {
            return DEGENESIS[key]
        })
        
        Handlebars.registerHelper("configLookup", function (obj, key) {
            return DEGENESIS[obj][key]
        })

        Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });

        Handlebars.registerHelper('addPrefilled', function(prefilledModRow) {
            let fullText = []
            fullText.push(prefilledModRow)
            let formatText = ""
            formatText += fullText;
                return (formatText);
        });
    })
}
