import { z } from "zod";

const SearchMetadataSchema = z
	.object({
		id: z.string().optional(),
		status: z.string().optional(),
		created_at: z.string().optional(),
		request_time_taken: z.number().optional(),
		parsing_time_taken: z.number().optional(),
		total_time_taken: z.number().optional(),
		request_url: z.string().optional(),
		html_url: z.string().optional(),
		json_url: z.string().optional(),
	})
	.passthrough();

const SearchParametersSchema = z
	.object({
		engine: z.string().optional(),
		page_id: z.string().optional(),
		ad_type: z.string().optional(),
		country: z.string().optional(),
		media_type: z.string().optional(),
		sort_by: z.string().optional(),
	})
	.passthrough();

const SearchInformationSchema = z
	.object({
		total_results: z.number().optional(),
		ad_library_page_info: z
			.object({ hidden_ads: z.number().optional() })
			.passthrough()
			.optional(),
		page: z
			.object({ name: z.string().optional(), id: z.string().optional() })
			.passthrough()
			.optional(),
	})
	.passthrough();

const VideoSchema = z
	.object({
		video_hd_url: z.string().optional(),
		video_preview_image_url: z.string().optional(),
		video_sd_url: z.string().optional(),
	})
	.passthrough();

const CardSchema = z
	.object({
		body: z.string().optional(),
		cta_type: z.string().optional(),
		link_description: z.string().optional(),
		link_url: z.string().optional(),
		title: z.string().optional(),
		cta_text: z.string().optional(),
		original_image_url: z.string().optional(),
		resized_image_url: z.string().optional(),
	})
	.passthrough();

const SnapshotSchema = z
	.object({
		page_id: z.string().optional(),
		page_profile_uri: z.string().optional(),
		page_name: z.string().optional(),
		page_profile_picture_url: z.string().optional(),
		caption: z.string().optional(),
		cta_text: z.string().optional(),
		body: z.object({ text: z.string().optional() }).passthrough().optional(),
		cta_type: z.string().optional(),
		display_format: z.string().optional(),
		link_description: z.string().optional(),
		link_url: z.string().optional(),
		page_categories: z.array(z.string()).optional(),
		page_like_count: z.number().optional(),
		title: z.string().optional(),
		videos: z.array(VideoSchema).optional(),
		cards: z.array(CardSchema).optional(),
	})
	.passthrough();

const AdSchema = z
	.object({
		ad_archive_id: z.string().optional(),
		collation_count: z.number().optional(),
		collation_id: z.string().optional(),
		page_id: z.string().optional(),
		snapshot: SnapshotSchema.optional(),
		is_active: z.boolean().optional(),
		page_name: z.string().optional(),
		impressions_with_index: z
			.object({ impressions_index: z.number().optional() })
			.passthrough()
			.optional(),
		gated_type: z.string().optional(),
		categories: z.array(z.string()).optional(),
		is_aaa_eligible: z.boolean().optional(),
		end_date: z.string().optional(),
		publisher_platform: z.array(z.string()).optional(),
		start_date: z.string().optional(),
		hide_data_status: z.string().optional(),
	})
	.passthrough();

export const MetaAdLibraryResponseSchema = z
	.object({
		search_metadata: SearchMetadataSchema.optional(),
		search_parameters: SearchParametersSchema.optional(),
		search_information: SearchInformationSchema.optional(),
		ads: z.array(AdSchema).optional(),
	})
	.passthrough();

export type MetaAdLibraryResponse = z.infer<typeof MetaAdLibraryResponseSchema>;
export type AdSchemaType = z.infer<typeof AdSchema>;
