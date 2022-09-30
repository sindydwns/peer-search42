/**
 * Select
 * @param {string} title
 * @param {Array<{title:String, value:String, selected:Boolean}>} items
 * @param {string} actionId
 * @returns
 */
export function BlockSelect(title, items, actionId) {
    items = items?.filter((x) => x.title && x.value);
    if (title == null || title == "" || items == null || items.length === 0) return [];
    const options = items.map((x) => ({
        text: {
            type: "plain_text",
            text: x.title,
            emoji: true,
        },
        value: String(x.value),
    }));
    const res = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: title,
        },
        accessory: {
            type: "static_select",
            placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
            },
            options,
            action_id: actionId,
        },
    };
    const selectedItem = items.filter((x) => x.selected)[0];
    const selectedOption = selectedItem ? options.filter((x) => x.value == selectedItem.value) : null;
    if (selectedOption) res.accessory.initial_option = selectedOption[0];
    return [res];
}

export function BlockMrkdwn(items) {
    items = items?.filter((x) => x);
    if (items == null || items.length === 0) return [];
    return items.map((x) => {
        return {
            type: "section",
            text: {
                type: "mrkdwn",
                text: x,
            },
        };
    });
}

export function BlockLabelInput(text, actionId) {
    if (text == null || text == "" || actionId == null || actionId == "") return [];
    return [
        {
            dispatch_action: true,
            type: "input",
            element: {
                type: "plain_text_input",
                action_id: actionId,
            },
            label: {
                type: "plain_text",
                text,
                emoji: true,
            },
        },
    ];
}

export function BlockLabelButton(label, text, actionId) {
    if (label == null || label == "") return [];
    if (text == null || text == "") return [];
    if (actionId == null || actionId == "") return [];
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: label,
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    text,
                    emoji: true,
                },
                value: "click_me_123",
                action_id: actionId,
            },
        },
    ];
}

export function BlockHeader(text) {
    if (text == null || text == "") return [];
    return [
        {
            type: "header",
            text: {
                type: "plain_text",
                text,
                emoji: true,
            },
        },
    ];
}

/**
 *
 * @param {Array<text:String, value:String, actionId:String>} items
 * @returns
 */
export function BlockButtons(items) {
    items = items
        ?.filter((x) => x.text != null && x.text != "")
        .filter((x) => x.actionId != null && x.actionId != "")
        .filter((x) => x.value != null && x.value != "");
    if (items == null || items.length === 0) return [];
    return [
        {
            type: "actions",
            elements: items.map((x) => ({
                type: "button",
                text: {
                    type: "plain_text",
                    text: x.text,
                    emoji: true,
                },
                value: x.value,
                action_id: x.actionId,
            })),
        },
    ];
}

export function BlockContext(text) {
    if (text == null || text == "") return [];
    return [
        {
            type: "context",
            elements: [
                {
                    type: "plain_text",
                    text,
                    emoji: true,
                },
            ],
        },
    ];
}

/**
 *
 * @param {Array<String>} items
 * @returns {Array}
 */
export function BlockList(items) {
    items = items?.filter((x) => x);
    if (items == null || items.length === 0) return [];
    let text = "";
    for (let i in items) {
        text = text + `•  ${items[i]} \n`;
    }
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: text,
            },
        },
    ];
}

export function BlockDivider() {
    return [
        {
            type: "divider",
        },
    ];
}
/**
 *
 * @param {String} titleText
 * @param {Array<title:String, value:String, selected:Boolean>} gls
 * @returns
 */
export function ModalTemplate(titleText, inputText, gls, callbackText) {
    return {
        type: "modal",
		notify_on_close: true,
        callback_id : callbackText, 
        title: {
            type: "plain_text",
            text: titleText,
            emoji: true,
        },
        submit: {
            type: "plain_text",
            text: "Submit",
            emoji: true,
        },
        close: {
            type: "plain_text",
            text: "Cancel",
            emoji: true,
        },
        blocks: gls ? BlockSelect(inputText, gls, "modalDelGroup") : BlockLabelInput(inputText, "modalAddGroup"),
    };
}
