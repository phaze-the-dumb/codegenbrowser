let gameVersionDropdownLabel = document.querySelector('#gameVersionDropdown');
let gameVersionDropdown = document.querySelector('#gameVersionIDs');

let server = 'https://codegen.phazed.xyz';
let win;
let classesDiv;
let classData;
let version;
let clsWin;
let classWindow;
let codeWin;

let load = () => {
    win = new Win('Select Game Version');
    win.content.innerHTML = '<h2 style="margin: 5px; margin-bottom: -10px; text-align: center;">Loading...</h2>';

    fetch(server+'/codegen/versions.json').then(data => data.json()).then(data => {
        win.content.innerHTML = '';
        gameVersionDropdown.innerHTML = '';

        data.forEach(ver => {
            gameVersionDropdown.innerHTML += '<a onclick="selectVersion(\''+ver+'\')">'+ver+'</a>'
            win.content.innerHTML += '<div class="verButton" onclick="selectVersion(\''+ver+'\')">'+ver+'</div>';
        })
    })
}

let selectVersion = ( ver ) => {
    if(classWindow)classWindow.yeet();

    if(!win)win = new Win('Select Game Version');
    gameVersionDropdownLabel.innerHTML = 'Game Version: '+ver
    win.setTitle('Loading Data...');

    version = ver;
    win.content.innerHTML = '<h2 style="margin: 5px; margin-bottom: -10px; text-align: center;">Downloading JSON...</h2>';

    if(getUrlParam('cls'))
        window.history.replaceState(null, document.title, '?ver='+version+'&cls='+getUrlParam('cls'));
    else
        window.history.replaceState(null, document.title, '?ver='+version);

    fetch(server+'/codegen/names/'+ver+'.json').then(data => {
        win.content.innerHTML = '<h2 style="margin: 5px; margin-bottom: -10px; text-align: center;">Parsing JSON...</h2>';

        data.json().then(dta => {
            win.content.innerHTML = '<h2 style="margin: 5px; margin-bottom: -10px; text-align: center;">Loading GUI...</h2>';
            loadGUI(dta);
        })
    })
}

let loadGUI = ( data ) => {
    classData = data;

    classWindow = new Win('Classes', 450);
    classWindow.div.style.left = '10px';
    classWindow.div.style.top = '55px';
    classWindow.div.style.transform = 'translate(0, 0)';

    let inputFilter = document.createElement('input');
    inputFilter.classList.add('textInput');
    inputFilter.type = 'text';
    inputFilter.placeholder = 'Filter Classes...';

    inputFilter.oninput = () => {
        filterClasses(inputFilter.value);
    }

    classesDiv = document.createElement('div');
    classesDiv.style.overflowY = 'auto';
    classesDiv.style.overflowX = 'hidden';
    classesDiv.style.marginTop = '10px';
    classesDiv.style.height = (window.innerHeight - 200) + 'px';

    filterClasses('');

    classWindow.content.appendChild(inputFilter);
    classWindow.content.appendChild(classesDiv);

    win.yeet();
    win = null;

    if(getUrlParam('cls'))
        openClass(getUrlParam('cls'));
}

let filterClasses = ( filterQuery ) => {
    let text  = '';
    classData.forEach(cls => {
        if(cls.toLowerCase().includes(filterQuery.toLowerCase()))
            text += '<div class="cls" onclick="openClass(\''+cls+'\')">'+cls+'</div>';
    })

    classesDiv.innerHTML = text;
}

let openClass = ( cls ) => {
    if(clsWin)clsWin.yeet();
    if(codeWin)codeWin.yeet();
    window.history.replaceState(null, document.title, '?ver='+version+'&cls='+cls);

    clsWin = new Win(cls + ': ' + version, window.innerWidth - 540);
    clsWin.div.style.top = '55px';
    clsWin.div.style.transform = 'translate(0, 0)';
    clsWin.div.style.left = '500px';
    clsWin.content.innerHTML = 'Loading...';
    clsWin.content.style.height = (classWindow.content.clientHeight / 2) + 'px';
    clsWin.content.style.overflow = 'auto';

    fetch(server+'/codegen/data/'+version+'/'+cls+'.json').then(data => data.json()).then(data => {
        let text = '';

        text += '<h1>Info</h1>';
        if(data.Parent){
            text += 'Parent: ' + getNamespace(data.Parent.Namespace) + '.' + data.Parent.Name + '<br />';
        } else{
            text += 'Parent: None<br />';
        }
        
        text += 'Is Nested: ' + data.This.IsNested + '<br />';
        text += 'Is Generic Template: ' + data.This.IsGenericTemplate + '<br />';

        text += '<h1>Instance Fields</h1>';
        data.InstanceFields.forEach(instanceField => {
            text += '<div class="cls">' + instanceField.Name + ': ' + getNamespace(instanceField.Type.Namespace) + '.' + instanceField.Type.Name + '</div>';
        })

        text += '<br />';
        text += '<h1>Methods / Hooks</h1>';
        text += '<h3>Clicking on these will attempt to generate code for hooking, IT WILL NOT WORK if you click on a method and NOT A HOOK!</h3>';
        data.Methods.forEach((method, i) => {
            let args = [];
            method.Parameters.forEach(p => {
                args.push(p.Name + ': ' + p.Type.Namespace + '.' + p.Type.Name)
            })

            text += '<div class="cls" onclick="genHookCode(\''+cls+'\', \''+i+'\')">' + method.Name + '(' + args.join(', ') + '): ' + getNamespace(method.ReturnType.Namespace) + '.' + method.ReturnType.Name + '</div>';
        })

        text += '<br />';
        text += '<h1>Static Fields</h1>';
        data.StaticFields.forEach(field => {
            text += '<div class="cls">' + field.Name + ': ' + getNamespace(field.Type.Namespace) + '.' + field.Type.Name + '</div>';
        })

        clsWin.content.innerHTML = text;

        codeWin = new Win('Code', window.innerWidth - 540);
        codeWin.div.style.top = (clsWin.div.clientHeight + 75) + 'px';
        codeWin.div.style.transform = 'translate(0, 0)';
        codeWin.div.style.left = '500px';
        codeWin.content.style.height = classWindow.content.clientHeight - (clsWin.div.clientHeight + 20)
        codeWin.content.classList.add('code');

        fetch(server + '/codegen/cpp/'+version+'/'+getNamespace(data.This.QualifiedCppName.split('::')[1])+'/'+data.This.QualifiedCppName.split('::')[2]+'.hpp')
            .then(data => {
                if(data.status !== 200){
                    codeWin.yeet();
                    clsWin.content.style.height = (classWindow.content.clientHeight) + 'px';
                } else{
                    data.text().then(text => {
                        codeWin.content.innerHTML = colourCode(text);
                    })
                }
            })
    })
}

let genHookCode = ( cls, index ) => {
    let hookWin = new Win('Loading...', 750);
    zIndexCount++
    hookWin.div.style.zIndex = zIndexCount;

    fetch(server+'/codegen/data/'+version+'/'+cls+'.json').then(data => data.json()).then(data => {
        hookWin.setTitle(cls + '_' + data.Methods[index].Name);
        hookWin.content.classList.add('code');
        hookWin.content.style.maxHeight = '450px';

        let method = data.Methods[index];
        let argsText = '';
        let includesText = '';
        let args = [];

        method.Parameters.forEach((param, i) => {
            args.push(param.Name)

            if(i + 1 === method.Parameters.length){
                if(param.Type.Namespace === ''){
                    includesText += '#include "GlobalNamespace/' + param.Type.Name + '.hpp"\n'
                    argsText += '    '+param.Type.Name + '* ' + param.Name
                } else{
                    if(getNamespace(param.Type.Namespace) !== '')
                        argsText += '    '+getNamespace(param.Type.Namespace) + '::' + param.Type.Name + ' ' + param.Name
                    else
                        argsText += '    '+getName(param.Type.Name) + ' ' + param.Name + ',\n'
                }
            } else{
                if(param.Type.Namespace === ''){
                    includesText += '#include "GlobalNamespace/' + param.Type.Name + '.hpp"\n'
                    argsText += '    '+param.Type.Name + '* ' + param.Name + ',\n'
                } else{
                    if(getNamespace(param.Type.Namespace) !== '')
                        argsText += '    '+getNamespace(param.Type.Namespace) + '::' + param.Type.Name + ' ' + param.Name + ',\n'
                    else
                        argsText += '    '+getName(param.Type.Name) + ' ' + param.Name + ',\n'
                }
            }
        })

        hookWin.content.innerHTML = colourCode(`// Includes
// INCLUDES ARE A WIP FEATURE DO NOT TRUST THE OUTPUT OF THIS
#include "GlobalNamespace/${cls}.hpp"
${includesText}
        
// Making The Hook
// DOUBLE CHECK THE STARS ARE IN THE CORRECT PLACE IT DOESN'T ALWAYS GET THEM RIGHT
MAKE_HOOK_MATCH(${cls}_${method.Name}, ${cls}::${method.Name}, ${method.ReturnType.Namespace}::${method.ReturnType.Name},
    ${cls}* self,
${argsText}
) {
    // Your Code Here

    ${cls}_${method.Name}(${args.join(', ')})
}

// Installing The Hook
INSTALL_HOOK(logger, ${cls}_${method.Name})`);
    })
}

load();

let getName = ( name ) => {
    if(name === 'Single')
        return 'float'
    else if(name === 'Boolean')
        return 'bool'
    else if(name === 'Int32')
        return 'int'
    else if(name === 'String')
        return 'string'
    else
        return name.toLowerCase();
}

let getNamespace = ( ns ) => {
    if(ns.toLowerCase() === 'system')
        return '';
    else
        return ns || 'GlobalNamespace';
}

fetch(server+'/codegen/status').then(data => data.text()).then(data => document.querySelector('#status').innerHTML = 'Task: '+data)
setInterval(() => {fetch(server+'/codegen/status').then(data => data.text()).then(data => document.querySelector('#status').innerHTML = 'Task: '+data)}, 10000);

let getUrlParam = (parameter) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameter);
}

if(getUrlParam('ver'))
    selectVersion(getUrlParam('ver'));