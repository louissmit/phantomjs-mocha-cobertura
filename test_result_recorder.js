var Cobertura = {
    generateReport: function (a) {
        var a = a.evaluate(function () {
            var a = {
                files: 0,
                packages: 0,
                testableLines: 0,
                testedLines: 0,
                untestedLines: 0,
                packageMap: {}
            };
            if (_$jscoverage) for (var b in _$jscoverage) if (_$jscoverage.hasOwnProperty(b)) {
				var c = _$jscoverage[b],
                    d;
                d = b.split("/");
                d.pop();
                d = d.join(".");
                a.files++;
                a.packageMap[d] || (a.packages++, a.packageMap[d] = {
                    testableLines: 0,
                    testedLines: 0,
                    untestedLines: 0,
                    classMap: {}
                });
                a.packageMap[d].classMap[b] = {
                    source: c.source,
                    file: b,
                    classPath: d,
                    testableLines: 0,
                    testedLines: 0,
                    untestedLines: 0,
                    coverage: {}
                };
                for (var e = 0; e < c.source.length; e++) {
                    var e = parseInt(e, 10),
                        g = c[e + 1],
                        h = 0;
                    g !== void 0 ? (a.testableLines++, a.packageMap[d].testableLines++, a.packageMap[d].classMap[b].testableLines++, g > 0 && (h = g, a.testedLines++, a.packageMap[d].testedLines++, a.packageMap[d].classMap[b].testedLines++), a.packageMap[d].classMap[b].coverage[e] = {
                        hits: h
                    }) : (a.packageMap[d].untestedLines++, a.packageMap[d].classMap[b].untestedLines++)
                }
            }
            return a
        });
        var b = [];
        b.push("<?xml version='1.0' encoding='UTF-8'?>");
        b.push("<!DOCTYPE coverage SYSTEM 'http://cobertura.sourceforge.net/xml/coverage-03.dtd'>");
        b.push("<coverage line-rate='" + a.testedLines / a.testableLines + "' branch-rate='0' version='3.5.1' timestamp='" + (new Date).getTime().toString() + "'>");
        b.push("\t<sources/>");
        b.push("\t<packages>");
        for (var c in a.packageMap) {
            b.push("\t\t<package name='" + c + "' line-rate='" + a.packageMap[c].testedLines / a.packageMap[c].testableLines + "' branch-rate='0' complexity='0'>");
            b.push("\t\t\t<classes>");
			for (var d in a.packageMap[c].classMap) {
				//TODO: "filename= client" should not be hardcoded!!??
                b.push("\t\t\t\t<class name='" + d + "' filename='" + "client" + "/" + a.packageMap[c].classMap[d].file + "' line-rate='" + a.packageMap[c].classMap[d].testedLines / a.packageMap[c].classMap[d].testableLines + "' branch-rate='0'>");
                b.push("\t\t\t\t\t<lines>");
                for (var e in a.packageMap[c].classMap[d].coverage) b.push("\t\t\t\t\t\t<line number='" + (parseInt(e, 10) + 1).toString() + "' hits='" + a.packageMap[c].classMap[d].coverage[e].hits.toString() + "' branch='false' />");
                b.push("\t\t\t\t\t</lines>");
                b.push("\t\t\t\t</class>")
            }
            b.push("\t\t\t</classes>");
            b.push("\t\t</package>")
        }

        b.push("\t</packages>");
        b.push("</coverage>");
        console.log("Coverage measured (" + Math.round(a.testedLines / a.testableLines * 100) + "%):");
        console.log("\t" + a.packages + " packages");
        console.log("\t" + a.files + " files");
        return b.join("\n")
    }
};

function waitFor(a, b, c) {
    var d = c ? c : 3001,
        e = (new Date).getTime(),
        f = false,
        i = setInterval(function () {
            var c = (new Date).getTime() - e;
            if (c < d && !f) f = a();
            else {
                clearInterval(i);
                if (!f) throw "waitFor() timeout";
                console.log("Page load time: " + c + "ms.");
                b()
            }
        }, 250)
};
var File = {
    fs: require("fs"),
    save: function (a, b) {
        this.fs.write(a, b, "w")
    },
    getJavascriptsFromDirectory: function (a) {
        for (var b = [], c = this.fs.list(a), d = 0; d < c.length; d++) if (c[d] !== "." && c[d] !== "..") {
            var e = a + this.fs.separator + c[d];
            this.fs.isFile(e) && e.indexOf(".js") !== -1 ? b.push(e) : this.fs.isDirectory(e) && (b = b.concat(this.getJavascriptsFromDirectory(e)))
        }
        return b
    }
};

var Coverage = {
    fs: require("fs"),
    options: {},
    page: null,
    initialize: function (a) {
        this.options = this.getOptions(a);
        phantom.injectJs(this.options.config);
        switch (a[0]) {
            case "run":
                this.run()
        }
    },

    run: function () {
        this.page = new WebPage;
	this.junit = "";
	var self = this;
        this.page.onConsoleMessage = function (a) {
            self.junit = self.junit + a;
        };
        this.page.open(Config.target + "/client/scripts/test/xunit.html", function (a) {
            if (a !== "success") throw "Unable to access network";
            else waitFor(function () {
                    return this.Coverage.isTestCompleted()
                }, function () {
                    Coverage.createReports();
                    phantom.exit(0)
                },
                6E4)
        })
    },
    createReports: function () {
	console.log("ready to start generating reports")
	var a = this.junit;
        var b = Cobertura.generateReport(this.page, this.options);
        File.save(Config.output.junit, a);
        File.save(Config.output.cobertura, b)
    },
    isTestCompleted: function () {
        return this.page.evaluate(function () {
            return document.testcompleted;
        })
    },
    getOptions: function (a) {
        for (var b = {}, c = 0; c < a.length; c++) a[c].indexOf("--") === 0 && (c + 1 < a.length && a[c + 1].indexOf("--") === 0 ? b[a[c].replace("--", "")] = true : c + 1 < a.length && (b[a[c].replace("--", "")] = a[c + 1]));
        return b
    }
};
Coverage.initialize(phantom.args);
