// glitch: not making both name and code grey and you can have same name/code for diff accounts

// additions (must include)
// add extra codes (abs, rep)

import { myIncludes, updateUser } from './general.js'
import { showMessage } from '../cautionTable.js';
import { updateDisplay } from './updateDisplay.js';

const codeConsole = document.getElementById('console');

// global mutable variable (used in multiple functions)
let slot;
let cancel;
let deleteAccount;
let add;
let showCell;
let inputs;
let imageInput;
let inputsClicked = [false, false];
let loadImage;

const addStatus = () => {
    const retval = sessionStorage.getItem('addStatus');
    if (retval === 'undefined') {
        return undefined;
    }
    return JSON.parse(retval);
}

const updateSlot = i => {
    slot = document.getElementById('edit-slot' + i);
    cancel = document.getElementById('slot' + i + '-cancel');
    add = document.getElementById('slot' + i + '-add');
    deleteAccount = document.getElementById('slot' + i + '-delete');
    showCell = document.getElementById('slot' + i);
    inputs = [document.getElementById(`edit-slot${i}-name`), document.getElementById(`edit-slot${i}-code`)];
    imageInput = document.getElementById(`edit-slot${i}-image`);

    imageInput.addEventListener('change', () => {
        const reader = new FileReader();
        const file = imageInput.files[0];

        reader.addEventListener('load', () => {
            if (file['type'].split('/')[0] === 'image')
                loadImage = reader.result;
        })
        reader.readAsDataURL(file);
    });
}

const change = () => {
    for (let i = 0; i < inputs.length; ++i) {
        inputs[i].addEventListener('keydown', e => {
            if (e.keyCode !== 13 && !inputsClicked[i]) {
                inputs[i].value = '';
                inputs[i].style.color = 'black';
                inputsClicked[i] = true;
            }
        })
        inputs[i].addEventListener('click', () => {
            if (!inputsClicked[i]) {
                inputs[i].value = '';
                inputs[i].style.color = 'black';
                inputsClicked[i] = true;
            }
        })
    }

    showCell.style.visibility = 'hidden';
    slot.style.visibility = 'visible';
    codeConsole.style.display = 'none';
    cancel.style.display = 'block';
    add.style.display = 'block';

    if (addStatus() === false) {
        deleteAccount.style.display = 'block';
        add.src = 'images/update.png';
        inputs[0].value = 'CHANGE ACCOUNT NAME';
        inputs[1].value = 'CHANGE ACCOUNT CODE';
    }
}
const unchange = (user) => {
    showCell.style.visibility = 'visible';
    slot.style.visibility = 'hidden';
    codeConsole.style.display = 'block';
    cancel.style.display = 'none';
    deleteAccount.style.display = 'none';
    add.src = 'images/addAccount.png';
    add.style.display = 'none';
    inputs[0].value = 'ADD ACCOUNT NAME';
    inputs[1].value = 'ADD ACCOUNT CODE';
    inputs[0].style.color = 'rgb(129, 129, 129)';
    inputs[1].style.color = 'rgb(129, 129, 129)';
    inputsClicked = [false, false];
    sessionStorage.setItem('addStatus', undefined);
    updateDisplay(user);
}

const buttonEvents = (user, i) => {
    const confirmInputs = () => {
        const name = inputs[0].value.toUpperCase();
        const code = inputs[1].value.toLowerCase();

        if (name[0] === ' ' || code[0] === ' ') {
            showMessage(true, 'Name and code must not start with a space');
        } else if (code === 'abs') {
            showMessage(true, 'abs is an already existing code');
        } else if (addStatus()) {
            if (name === '' || code === '' || !inputsClicked[0] || !inputsClicked[1]) {
                showMessage(true, 'Name and code must both be filled in');
            } else if (myIncludes(user, 'name', name) !== -1) {
                showMessage(true, 'Account name already exists');
            } else if (myIncludes(user, 'code', code) !== -1) {
                showMessage(true, 'Account code already exists');
            } else {
                user.accounts[i].name = name;
                user.accounts[i].code = code;
                if (loadImage) {
                    user.accounts[i].image = loadImage;
                } else {
                    user.accounts[i].image = 'images/check.png';
                }

                if (updateUser(user).error) {
                    showMessage(true, 'Something went wrong');
                } else {
                    showMessage(false, 'Account has successfully been created');
                    unchange(user);
                }
            }
        } else if (addStatus() === false) {
            const nameExists = myIncludes(user, 'name', name);
            const codeExists = myIncludes(user, 'code', inputs[1].value);

            let inputsValid = [nameExists === i || nameExists === -1, codeExists === i || codeExists === -1];
            let makeChange = false;
            if ((name === '' || !inputsClicked[0]) && (code === '' || !inputsClicked[1])) {
                if (user.accounts[i].image === loadImage || !loadImage) {
                    showMessage(true, 'One of the inputs must be filled in');
                }
            } else if (name === '' || !inputsClicked[0]) {
                if (inputsValid[1]) {
                    makeChange = true;
                    user.accounts[i].code = code;
                } else {
                    showMessage(true, 'Account code already exists');
                }
            } else if (code.value === '' || !inputsClicked[1]) {
                if (inputsValid[0]) {
                    makeChange = true;
                    user.accounts[i].name = name;
                } else {
                    showMessage(true, 'Account name already exists');
                }
            } else {
                if (inputsValid[0] && inputsValid[1]) {
                    makeChange = true;
                    user.accounts[i].name = name;
                    user.accounts[i].code = code;
                } else {
                    showMessage(true, 'Account name and code already exist');
                }
            }
            if (loadImage) {
                user.accounts[i].image = loadImage;
            }

            if (makeChange) {
                if (updateUser(user).error) {
                    showMessage(true, 'Something went wrong');
                } else {
                    showMessage(false, 'Account has successfully been changed');
                    unchange(user);
                }
            }
        }
    }

    add.addEventListener('click', () => {
        confirmInputs();
    });

    cancel.addEventListener('click', () => {
        unchange(user);
    });

    deleteAccount.addEventListener('click', () => {
        user.accounts[i].name = null;
        user.accounts[i].code = null;
        user.accounts[i].image = null;
        user.balance -= user.accounts[i].amount;
        user.accounts[i].amount = 0;

        if (updateUser(user).error) {
            showMessage(true, 'Something went wrong');
        } else {
            showMessage(false, 'Account has successfully been deleted');
            unchange(user);
        }
    });

    const enterKey = 13;
    const escKey = 27;
    for (let i = 0; i < inputs.length; ++i) {
        inputs[i].addEventListener('keyup', e => {
            if (e.keyCode === enterKey) {
                confirmInputs();
            }
        });
    }
    document.addEventListener('keyup', e => {
        if (e.keyCode === escKey) {
            unchange(user);
        }
    });
}

export const changeAccounts = user => {
    const accountsCount = 8;
    let slotIcons = [];
    for (let i = 2; i < accountsCount; ++i) {
        slotIcons[i] = document.getElementById('slot' + i + '-icon');
        slotIcons[i].addEventListener('click', () => {

            if (addStatus() !== undefined) return;

            sessionStorage.setItem('addStatus', !user.accounts[i].name);
            updateSlot(i);
            change();
            buttonEvents(user, i);
        });
    }
}