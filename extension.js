var vscode = require('vscode');
var axios = require('axios');

function activate(context) {
    console.log('Extension "gi" is now active!');

    var disposable = vscode.commands.registerCommand('extension.gi', function () {
        var giURL = 'https://www.gitignore.io/api/';

        axios.get(giURL + 'list')
            .then(function (response) {
                var rawList = response.data;
                rawList = rawList.replace(/(\r\n|\n|\r)/gm, ",");
                var formattedList = rawList.split(',');

                var options = {
                    ignoreFocusOut: false,
                    placeHolder: 'Search Operating Systems, IDEs, or Programming Languages'
                };

                vscode.window.showQuickPick(formattedList, options)
                    .then(function (val) {
                        vscode.window.showInformationMessage('You picked ' + val);
                        axios.get(giURL + val)
                            .then(function (response) {
                                console.log(response.data);
                            })
                            .catch(function (err) {
                                console.log(err);
                            })
                    });
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