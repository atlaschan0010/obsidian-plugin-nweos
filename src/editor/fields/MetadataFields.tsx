import { Setting } from 'obsidian';
import { Metadata } from '../../types/nweos';

export interface MetadataFieldsProps {
  value: Metadata;
  onChange: (value: Metadata) => void;
}

const NOVEL_TRACK_OPTIONS = [
  '玄幻仙侠',
  '古言宫斗',
  '现言都市',
  '科幻末世',
  '悬疑刑侦',
  '其他'
];

const CHARACTER_POSITION_OPTIONS = [
  '男主',
  '女主',
  '男二',
  '女二',
  '核心反派',
  '关键配角',
  '群像主角',
  '其他'
];

export function renderMetadataFields(container: HTMLElement, props: MetadataFieldsProps): void {
  const { value, onChange } = props;

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '核心元数据';

    new Setting(section)
      .setName('角色名称 *')
      .addText(text => {
        text.setValue(value.character_name).onChange(val => {
          onChange({ ...value, character_name: val });
        });
      });

    new Setting(section)
      .setName('作品名称')
      .addText(text => {
        text.setValue(value.work_name || '').onChange(val => {
          onChange({ ...value, work_name: val });
        });
      });

    new Setting(section)
      .setName('赛道分类')
      .addDropdown(dropdown => {
        NOVEL_TRACK_OPTIONS.forEach(option => {
          dropdown.addOption(option, option);
        });
        dropdown.setValue(value.novel_track || '');
        dropdown.onChange(val => {
          onChange({ ...value, novel_track: val });
        });
      });

    new Setting(section)
      .setName('角色定位')
      .addDropdown(dropdown => {
        CHARACTER_POSITION_OPTIONS.forEach(option => {
          dropdown.addOption(option, option);
        });
        dropdown.setValue(value.character_position || '');
        dropdown.onChange(val => {
          onChange({ ...value, character_position: val });
        });
      });

    new Setting(section)
      .setName('角色版本')
      .addText(text => {
        text.setValue(value.character_version || '1.0').onChange(val => {
          onChange({ ...value, character_version: val });
        });
      });

    new Setting(section)
      .setName('作者')
      .addText(text => {
        text.setValue(value.author || '').onChange(val => {
          onChange({ ...value, author: val });
        });
      });

    new Setting(section)
      .setName('备注')
      .addTextArea(text => {
        text.setValue(value.notes || '').onChange(val => {
          onChange({ ...value, notes: val });
        });
      });
  });
}
