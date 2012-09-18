var Config = {

    // path of the temporary directory to store coverage files in (bin and src subdirs are created).
    // this directory is automatically removed by this tool, it's just required for the coverage executable.
    target: "coverage-build",

    // paths where to export you junit and cobertura results
    output: {
        junit: "reports/junit.xml",
        cobertura: "reports/cobertura.xml"
    }

};
