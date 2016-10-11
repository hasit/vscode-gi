var fs = require('fs');
var path = require('path');

var vscode = require('vscode');
var axios = require('axios');
var errorEx = require('error-ex');

function activate(context) {
    console.log('Extension "gi" is now active!');

    var disposable = vscode.commands.registerCommand('extension.gi', function () {
        var giURL = 'https://www.gitignore.io/api/';
        var giError = new errorEx('giError');

        axios.get(giURL + 'list')
            .then(function (response) {
                var rawList = response.data;
                rawList = rawList.replace(/(\r\n|\n|\r)/gm, ",");
                var formattedList = rawList.split(',');

                const options = {
                    ignoreFocusOut: false,
                    placeHolder: 'Search Operating Systems, IDEs, or Programming Languages',
                };

                vscode.window.showQuickPick(formattedList, options)
                    .then(function (val) {
                        if (val === undefined) {
                            vscode.window.setStatusBarMessage('gi escaped', 3000);
                            var err = new giError('EscapeException');
                            throw err;
                        }
                        vscode.window.setStatusBarMessage('You picked ' + val, 3000);
                        axios.get(giURL + val)
                            .then(function (response) {
                                makeFile(response.data);
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                    });

                function makeFile(content) {
                    const choices = [{
                        label: 'Overwrite',
                        description: `Overwrite current .gitignore`
                    }, {
                        label: 'Append',
                        description: 'Append to current .gitignore'
                    }];

                    const options = {
                        matchOnDescription: true,
                        placeHolder: "A .gitignore file already exists in your current working directory. What would you like to do?"
                    };

                    var giFile = path.join(vscode.workspace.rootPath, '.gitignore');

                    fs.access(giFile, fs.F_OK, function (err) {
                        if (!err) {
                            console.log('.gitinore already exits');
                            vscode.window.showQuickPick(choices, options)
                                .then(function (val) {
                                    if (val === undefined) {
                                        var err = new giError('EscapeException');
                                        vscode.window.setStatusBarMessage('gi escaped', 3000);
                                        throw err;
                                    }
                                    if (!val) {
                                        return;
                                    }
                                    if (val.label === 'Overwrite') {
                                        writeToFile(content, true);
                                        vscode.window.showInformationMessage('.gitignore overwritten');
                                        return;
                                    }
                                    if (val.label === 'Append') {
                                        writeToFile(content, false);
                                        vscode.window.showInformationMessage('.gitignore appended');
                                        return;
                                    }
                                });
                        } else {
                            console.log('.gitinore does not exit');
                            writeToFile(content, true);
                            vscode.window.showInformationMessage('.gitignore created');
                            return;
                        }
                    });

                    function writeToFile(content, flag) {
                        if (flag === true) {
                            fs.writeFileSync(giFile, content, 'utf-8', function (err) {
                                if (err) {
                                    console.log('Failed to write to .gitignore');
                                } else {
                                    console.log('.gitignore created');
                                }
                            });
                        } else {
                            fs.appendFileSync(giFile, content, 'utf-8', function (err) {
                                if (err) {
                                    console.log('Failed to append to .gitignore');
                                } else {
                                    console.log('.gitignore appended');
                                }
                            });
                        }
                    }
                }
            })
            .catch(function (err) {
                console.log(err);
            });
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;