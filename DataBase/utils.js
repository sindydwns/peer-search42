import pool from "../apiDataBase.js";

// DB에 데이터를 넣을 때 한번에 넣을 수 있도록 value 배열을 string으로 변환해주는 함수
function valueArrayToStr (valueArr) {
	let str = "values";
	for (i in valueArr) {
		str += "(";
		valueArr[i].map(value => {
			str += `'${value}',`;
		});
		str = str.slice(0, -1);
		str += "),";
	}
	str = str.slice(0, -1);
	str += ";";
	return (str);
}

const connection = await pool.getConnection(async (conn) => conn);
export async function getAllLocationTable() {
    const [locations, ...other] = await connection.query("select target_id, host from location_status");
    const result = [];
    for (let location of locations) {
        result[location.target_id] = location.host;
    }
    return result;
}

export async function setAllLocationTable(table) {
    const keys = Object.keys(table);
    if (keys.length == 0) {
        await connection.query("update location_status set host = null");
        return;
    }
    await connection.query("replace into location_status(target_id, host) values ?", [
        keys.map(x => [x, table[x]])
    ]);
    await connection.query("update location_status set host = null where target_id not in (?)", [
        keys
    ]);
    return null;
}

export async function getAllReservedAlarm(seekerId) {
    if (seekerId == null) {
        const [alarms, ...other] = await connection.query("select alarm_id, seeker_id, target_id, slack_id from alarm");
        return alarms;
    }
    const [alarms, ...other] = await connection.query("select seeker_id, target_id, slack_id from alarm where seeker_id = ?", [seekerId]);
    return alarms;
}

/**
 * @param {Array<number>} ids 
 */
export async function deleteReservedAlarm(ids) {
    if (ids.length == 0)
        return ;
    await connection.query("delete from alarm where alarm_id in (?)", [ids]);
}

// export async function insertAlarm(seekerId, targetId, slackId) {
//     await connection.query("insert into alarm(seeker_id, target_id, slack_id) values(?, ?, ?)", [seekerId, targetId, slackId]);
// }

// export async function deleteAlarm(seekerId, targetId) {
//     await connection.query("delete from alarm where seeker_id = ? and target_id = ?", seekerId, targetId);
// }

export async function getSelectedGroupId(seekerId) {
    const [groupId, ...other] = await connection.query(
        "select gl.group_id from group_list gl where 1=1 and gl.seeker_id = ? and gl.selected = true;",
        [seekerId]
    );
    if (groupId.length === 0) return null;
    const returnVal = groupId[0].group_id;
    return returnVal;
}

export async function getGroupId(seekerId, groupName) {
    const [groupId, ...other] = await connection.query(
        "select gl.group_id from group_list gl where 1=1 and gl.seeker_id = ? and gl.group_name = ?",
        [seekerId, groupName]
    );
    if (groupId.length === 0) return null;
    const returnVal = groupId[0].group_id;
    return returnVal;
}

export async function getGroupList(seekerId) {
    const [groupName, ...other] = await connection.query(
        "select gl.group_id, gl.group_name, gl.selected from group_list gl where 1=1 and gl.seeker_id = ?",
        seekerId
    );
    return groupName;
}

export async function getMemberList(groupId) {
    const [groupUser, ...other] = await connection.query(
        "select gm.target_id from group_list gl inner join group_member gm on gl.group_id = gm.group_id where 1=1 and gl.group_id = ?",
        [groupId]
    );
    return groupUser;
}

export async function getAlarmList(seekerId) {
	const [alarmList, ...other] = await connection.query("select target_id from alarm where seeker_id=?", [seekerId]);
	return alarmList;
}

export async function getUsersLocationInfo(targetIds) {
	let locationInfo = [];
	for (const targetId of targetIds) {
		const [host, ...other] = await connection.query("select target_id, host from location_status where target_id=?", [targetId]);
		if (host[0] != null) // targetId가 유효하지 않은 경우는 제외 (나중에는 이미 앞에서 거르므로 이 부분은 지우면 됨)
			locationInfo.push(host[0]);
	}
    return locationInfo;
}

export async function getGroupLocationInfo(seekerId, groupId) {
    const [locationInfo, ...other] = await connection.query(
        "select gm.target_id, ls.host from group_list gl inner join group_member gm on gl.group_id = gm.group_id left join location_status ls on gm.target_id = ls.target_id where 1=1 and gl.seeker_id=? and gl.group_id=?",
        [seekerId, groupId]
    );
    return locationInfo;
}

export async function reflectWhetherSelected(seekerId, selectedGroupId) {
    await connection.query("update group_list set selected=false where seeker_id=?", [seekerId]);
    if (selectedGroupId != null)
		await connection.query("update group_list set selected=true where group_id=?", [selectedGroupId]);
}

export async function insertGroup(seekerId, groupName) {
	// const valueArr = [];
	// targetIds.map(targetId => {
	// 	valueArr.push([seekerId, tgroupNames]);
	// });
	// const valueArrStr = valueArrayToStr(valueArr);
	try {
		await connection.query("insert into group_list(group_id, seeker_id, group_name, selected) values (null, ?, ?, 0);", [seekerId, groupName]);
		return ('success');
	}
	catch (e) {
		console.error(e);
	}
}

export async function deleteGroup(seekerId, groupId) {
    try {
		await connection.query("delete from group_list where seeker_id=? and group_id=?;", [seekerId, groupId]);
		await connection.query("delete from group_member where group_id=?;", [groupId]);
		return ('success');
	}
	catch (e) {
		console.error(e);
	}	
}

export async function insertMember(groupId, targetId) {
	// const valueArr = [];
	// targetIds.map(targetId => {
	// 	valueArr.push([groupId, targetIds]);
	// });
	// const valueArrStr = valueArrayToStr(valueArr);
	try {
		await connection.query("insert into group_member(group_id, target_id) values(? , ?);", [groupId, targetId]);
		return ('success');
	}
	catch (e) {
		console.error(e);
	}
}

export async function deleteMember(groupId, targetId) {
	try {
		await connection.query("delete from group_member where group_id=? and target_id=?;", [groupId, targetId]);
		return ('success');
	}
	catch (e) {
		console.error(e);
	}
}

export async function insertAlarm(seekerId, targetId) {
	// const valueArr = [];
	// targetIds.map(targetId => {
	// 	valueArr.push([seekerId, targetIds]);
	// });
	// const valueArrStr = valueArrayToStr(valueArr);
	try {
		await connection.query("insert into alarm(seeker_id, target_id) values(? , ?);", [seekerId, targetId]);
		return ('success');
	}
	catch (e) {
		console.error(e);
	}
}

export async function deleteAlarm(seekerId, targetId) {
	try {
		await connection.query("delete from alarm where seeker_id=? and target_id=?;", [seekerId, targetId]);
		return ('success');
	}
	catch (e) {
		console.error(e);
	}
}
