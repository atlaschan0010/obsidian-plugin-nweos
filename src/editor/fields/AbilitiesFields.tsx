import { Setting } from 'obsidian';
import { Abilities, BasicAbility, CoreSkill, GoldFingerSystem } from '../../types/nweos';

export interface AbilitiesFieldsProps {
  value: Abilities;
  onChange: (value: Abilities) => void;
}

function createEditableTable(
  container: HTMLElement,
  title: string,
  data: any[],
  onChange: (data: any[]) => void,
  columns: { key: string; label: string; isTextArea?: boolean }[]
): void {
  const section = container.createDiv('nweos-form-section');

  const headerEl = section.createDiv('nweos-table-header');
  headerEl.createDiv('nweos-form-section-title').textContent = title;

  const tableEl = section.createDiv('nweos-editable-table');

  columns.forEach(col => {
    const colEl = tableEl.createDiv('nweos-table-col');
    colEl.createDiv('nweos-table-col-header').textContent = col.label;
  });
  tableEl.createDiv('nweos-table-col nweos-table-action-col').textContent = '';

  data.forEach((item, index) => {
    const rowEl = tableEl.createDiv('nweos-table-row');

    columns.forEach(col => {
      const cellEl = rowEl.createDiv('nweos-table-cell');
      if (col.isTextArea) {
        const textarea = window.document.createElement('textarea');
        textarea.value = item[col.key] || '';
        textarea.className = 'nweos-table-textarea';
        textarea.onchange = () => {
          const newData = [...data];
          newData[index] = { ...newData[index], [col.key]: textarea.value };
          onChange(newData);
        };
        cellEl.appendChild(textarea);
      } else {
        const input = window.document.createElement('input');
        input.type = 'text';
        input.value = item[col.key] || '';
        input.className = 'nweos-table-input';
        input.onchange = () => {
          const newData = [...data];
          newData[index] = { ...newData[index], [col.key]: input.value };
          onChange(newData);
        };
        cellEl.appendChild(input);
      }
    });

    const actionCell = rowEl.createDiv('nweos-table-cell nweos-table-action-col');
    const deleteBtn = window.document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.className = 'nweos-btn-delete';
    deleteBtn.onclick = () => {
      const newData = data.filter((_, i) => i !== index);
      onChange(newData);
    };
    actionCell.appendChild(deleteBtn);
  });

  const addRowEl = section.createDiv('nweos-table-add-row');
  const addBtn = window.document.createElement('button');
  addBtn.textContent = '+ 添加';
  addBtn.className = 'nweos-btn-add';
  addBtn.onclick = () => {
    const newItem: Record<string, any> = {};
    columns.forEach(col => {
      newItem[col.key] = '';
    });
    onChange([...data, newItem]);
  };
  addRowEl.appendChild(addBtn);
}

export function renderAbilitiesFields(container: HTMLElement, props: AbilitiesFieldsProps): void {
  const { value, onChange } = props;

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '能力与金手指体系说明';
    section.createEl('p', 'nweos-field-hint').textContent = '以下表格支持直接编辑，修改后自动保存';

    new Setting(section)
      .setName('致命缺陷')
      .setDesc('人物的致命弱点，用逗号分隔')
      .addText(text => {
        text.setValue(value.fatal_flaw.join(', ')).onChange(val => {
          onChange({ ...value, fatal_flaw: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.fatal_flaw.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.fatal_flaw.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-danger-tag');
        tagEl.textContent = tag;
        tagEl.style.border = '1px solid var(--background-modifier-error)';
      });
    }
  });

  const basicAbilityColumns = [
    { key: 'name', label: '能力名称' },
    { key: 'proficiency', label: '熟练度' },
    { key: 'plot_purpose', label: '剧情作用', isTextArea: true },
    { key: 'priority', label: '优先级' }
  ];

  createEditableTable(
    container,
    '基础能力',
    value.basic_abilities,
    (newData) => onChange({ ...value, basic_abilities: newData as BasicAbility[] }),
    basicAbilityColumns
  );

  const coreSkillColumns = [
    { key: 'name', label: '技能名称' },
    { key: 'description', label: '描述', isTextArea: true },
    { key: 'strength', label: '优势' },
    { key: 'weakness', label: '劣势' },
    { key: 'growth_line', label: '成长线' },
    { key: 'highlight_scene', label: '高光场景' }
  ];

  createEditableTable(
    container,
    '核心技能',
    value.core_skills,
    (newData) => onChange({ ...value, core_skills: newData as CoreSkill[] }),
    coreSkillColumns
  );

  const goldFingerColumns = [
    { key: 'name', label: '金手指名称' },
    { key: 'trigger_condition', label: '触发条件' },
    { key: 'limit_restriction', label: '限制规则' },
    { key: 'growth_rule', label: '成长规则' },
    { key: 'core_usage', label: '核心用途' }
  ];

  createEditableTable(
    container,
    '金手指系统',
    value.gold_finger_system,
    (newData) => onChange({ ...value, gold_finger_system: newData as GoldFingerSystem[] }),
    goldFingerColumns
  );
}
