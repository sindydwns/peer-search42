import { reflectWhetherSelected } from "../DataBase/utils.js";
import { getSeekerId } from "./utils/data.js";
import { mainHomeView, groupManageHomeView, alarmManageHomeView, memberManageHomeView, manualHomeView } from "./views.js";

export default (app) => {

    app.event("app_home_opened", async ({ event, client, logger }) => {
        try {
            const seekerId = await getSeekerId(null, event, client);

            const result = await client.views.publish({
                user_id: event.user,
                view: await mainHomeView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });

	app.action("goMainView", async ({ack, body, client}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await mainHomeView(seekerId)
			})
		}
	);

    app.action("goGroupManageView", async ({ ack, body, client, logger }) => {
        try {
            await ack();
            const seekerId = await getSeekerId(body, null, client);
			
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: await groupManageHomeView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
		client.previous_view_id = body.view.id;
    });

	app.action("goAlarmManageView", async ({ack, body, client, logger}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);

		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view : await alarmManageHomeView(seekerId),
		});
		client.previous_view_id = body.view.id;
	})
	
	app.action("goMemberManageView", async ({ack, body, client}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await memberManageHomeView(seekerId)
		})
	});

    app.action("goManualView", async ({ ack, body, client, logger }) => {
        try {
            await ack();
			
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: await manualHomeView(),
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("selectGlanceTarget", async ({ ack, body, client, logger }) => {
        await ack();
        const selected = body.actions[0].selected_option;
        const seekerId = await getSeekerId(body, null, client);

		await reflectWhetherSelected(seekerId, selected.value);

        await client.views.update({
            view_id: body.view.id,
            hash: body.view.hash,
            view: await mainHomeView(seekerId),
        });
    });
};