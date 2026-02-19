import { DurableObject } from "cloudflare:workers";
// import moment from "moment";

export interface FacebookAdvertiserPages {
	pageId: string;
	processed?: boolean;
	lastUpdate?: Date;
	pageName?: string;
}

export class AdDataUpdateScheduler extends DurableObject<Env> {
		facebookAdvertiserPages: FacebookAdvertiserPages | undefined;
		constructor(ctx: DurableObjectState, env: Env) {
			super(ctx, env);
			ctx.blockConcurrencyWhile(async () => {
				this.facebookAdvertiserPages = await ctx.storage.get<FacebookAdvertiserPages>("facebook_advertiser_pages");
			});
		}

	async addPageIds(pageIds: string[]) {
	        // todo - parse data to invalidate shitty strings
		for (const pageId of pageIds) {
		 const existing = await this.ctx.storage.get(pageId);
        if (!existing) {
            await this.ctx.storage.put(pageId, {
                pageId,
                processed: false,
                lastUpdate: new Date(),
            });
        }
		}
	}

	async showStatus() {
		const pages = await this.ctx.storage.list();
		return pages;
	}
	// 	async collectLinkClick(
	// 		accountId: string,
	// 		linkId: string,
	// 		destinationUrl: string,
	// 		destinationCountryCode: string,
	// 	) {
	// 		this.clickData = {
	// 			accountId,
	// 			linkId,
	// 			destinationUrl,
	// 			destinationCountryCode,
	// 		};
	// 		await this.ctx.storage.put("click_data", this.clickData);
	// 		const alarm = await this.ctx.storage.getAlarm();
	// 		if (!alarm) {
	// 			const oneDay = moment().add(24, "hours").valueOf();
	// 			await this.ctx.storage.setAlarm(oneDay);
	// 		}
	// 	}
	// 	async alarm() {
	// 		console.log("Evaluation scheduler alarm triggered");
	// 		const clickData = this.clickData;
	// 		if (!clickData) throw new Error("Click data not set");
	// 		await this.env.DESTINATION_EVALUATION_WORKFLOW.create({
	// 			params: {
	// 				linkId: clickData.linkId,
	// 				accountId: clickData.accountId,
	// 				destinationUrl: clickData.destinationUrl,
	// 			},
	// 		});
	// 	}


	// processPageIds
	// schedule
}
