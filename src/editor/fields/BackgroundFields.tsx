import { Setting } from 'obsidian';
import { BackgroundHistory, KeyLifeEvent } from '../../types/nweos';

export interface BackgroundFieldsProps {
  value: BackgroundHistory;
  onChange: (value: BackgroundHistory) => void;
}

function createKeyLifeEventsTable(
  container: HTMLElement,
  title: string,
  data: KeyLifeEvent[],
  onChange: (data: KeyLifeEvent[]) => void
): void {
  const section = container.createDiv('nweos-form-section');

  const headerEl = section.createDiv('nweos-table-header');
  headerEl.createDiv('nweos-form-section-title').textContent = title;

  const tableEl = section.createDiv('nweos-editable-table nweos-life-events-table');

  const columns = [
    { key: 'year', label: '年份' },
    { key: 'event', label: '事件' },
    { key: 'impact_on_personality', label: '对人格影响' },
    { key: 'plot_foreshadowing', label: '伏笔' }
  ];

  columns.forEach(col => {
    const colEl = tableEl.createDiv('nweos-table-col');
    colEl.createDiv('nweos-table-col-header').textContent = col.label;
  });
  tableEl.createDiv('nweos-table-col nweos-table-action-col').textContent = '';

  data.forEach((item, index) => {
    const rowEl = tableEl.createDiv('nweos-table-row');

    columns.forEach(col => {
      const cellEl = rowEl.createDiv('nweos-table-cell');
      const input = window.document.createElement('input');
      input.type = 'text';
      input.value = item[col.key as keyof KeyLifeEvent] || '';
      input.className = 'nweos-table-input';
      input.onchange = () => {
        const newData = [...data];
        newData[index] = { ...newData[index], [col.key]: input.value };
        onChange(newData);
      };
      cellEl.appendChild(input);
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
  addBtn.textContent = '+ 添加人生事件';
  addBtn.className = 'nweos-btn-add';
  addBtn.onclick = () => {
    const newItem: KeyLifeEvent = {
      year: '',
      event: '',
      impact_on_personality: '',
      plot_foreshadowing: ''
    };
    onChange([...data, newItem]);
  };
  addRowEl.appendChild(addBtn);
}

export function renderBackgroundFields(container: HTMLElement, props: BackgroundFieldsProps): void {
  const { value, onChange } = props;

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '过往经历';

    new Setting(section)
      .setName('起源故事')
      .setDesc('人物的背景故事和出身')
      .addTextArea(text => {
        text.setValue(value.origin_story || '').onChange(val => {
          onChange({ ...value, origin_story: val });
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '经历详情';

    new Setting(section)
      .setName('教育经历')
      .addTextArea(text => {
        text.setValue(value.education_experience || '').onChange(val => {
          onChange({ ...value, education_experience: val });
        });
      });

    new Setting(section)
      .setName('职业经历')
      .addTextArea(text => {
        text.setValue(value.career_experience || '').onChange(val => {
          onChange({ ...value, career_experience: val });
        });
      });

    new Setting(section)
      .setName('隐藏秘密')
      .setDesc('不为人知的秘密，可能影响剧情')
      .addTextArea(text => {
        text.setValue(value.hidden_secret || '').onChange(val => {
          onChange({ ...value, hidden_secret: val });
        });
      });

    new Setting(section)
      .setName('家庭背景')
      .addTextArea(text => {
        text.setValue(value.family_background || '').onChange(val => {
          onChange({ ...value, family_background: val });
        });
      });
  });

  createKeyLifeEventsTable(
    container,
    '关键人生事件',
    value.key_life_events,
    (newData) => onChange({ ...value, key_life_events: newData })
  );

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '伏笔库';

    const hintEl = section.createEl('p', 'nweos-field-hint');
    hintEl.textContent = '在上方"关键人生事件"中的"伏笔"列填写剧情伏笔，这些伏笔将在后续剧情中被回收和利用。';
    hintEl.style.color = 'var(--text-muted)';
    hintEl.style.fontSize = '0.85rem';
  });
}
