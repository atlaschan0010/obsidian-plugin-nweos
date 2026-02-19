import { NWEOSCharacter } from '../types/nweos';

export interface RedLineCheckResult {
	isValid: boolean;
	missingFields: string[];
	warnings: string[];
}

export function checkRedLines(character: NWEOSCharacter): RedLineCheckResult {
	const missingFields: string[] = [];
	const warnings: string[] = [];

	if (!character.metadata.character_name || character.metadata.character_name.trim() === '') {
		missingFields.push('角色名称');
	}

	if (!character.metadata.work_name || character.metadata.work_name.trim() === '') {
		missingFields.push('作品名称');
	}

	if (!character.core_position.core_tags || character.core_position.core_tags.length === 0) {
		missingFields.push('核心标签');
	}

	if (!character.identity.names.full_name || character.identity.names.full_name.trim() === '') {
		missingFields.push('姓名');
	}

	if (!character.psychology.core_personality.public_persona || character.psychology.core_personality.public_persona.trim() === '') {
		missingFields.push('公开人设');
	}

	if (!character.motivation_arc.core_drive || character.motivation_arc.core_drive.trim() === '') {
		missingFields.push('核心驱动力');
	}

	if (character.core_position.character_red_line.length === 0) {
		warnings.push('建议填写角色底线');
	}

	if (character.psychology.ooc_red_line.length === 0) {
		warnings.push('建议填写OOC底线');
	}

	if (!character.plot_binding.debut_chapter_node || character.plot_binding.debut_chapter_node.trim() === '') {
		warnings.push('建议填写出场章节节点');
	}

	return {
		isValid: missingFields.length === 0,
		missingFields,
		warnings
	};
}

export function getRedLineWarnings(character: NWEOSCharacter): string[] {
	const result = checkRedLines(character);
	const messages: string[] = [];

	if (result.missingFields.length > 0) {
		messages.push(`缺少必填项: ${result.missingFields.join(', ')}`);
	}

	if (result.warnings.length > 0) {
		messages.push(...result.warnings);
	}

	return messages;
}

export interface OOCRiskCheck {
	hasRisk: boolean;
	risks: string[];
	score: number;
}

export function checkOOCRisk(character: NWEOSCharacter, scene?: string): OOCRiskCheck {
	const risks: string[] = [];
	let score = 0;

	if (!character.psychology.ooc_red_line || character.psychology.ooc_red_line.length === 0) {
		risks.push('未设置OOC底线，无法判断是否OOC');
		score += 30;
	}

	if (!character.psychology.core_personality.public_persona) {
		risks.push('未设置公开人设');
		score += 20;
	}

	if (!character.behavior_pattern.speech_style.catchphrases || character.behavior_pattern.speech_style.catchphrases.length === 0) {
		risks.push('未设置标志性口头禅，可能导致语言风格不一致');
		score += 15;
	}

	if (character.psychology.personality_model.ocean) {
		const ocean = character.psychology.personality_model.ocean;
		if (ocean.neuroticism > 80) {
			risks.push('神经质过高，创作时需注意情绪波动描写');
			score += 10;
		}
	}

	return {
		hasRisk: score > 50,
		risks,
		score
	};
}
