import { Setting } from 'obsidian';
import { RelationshipNetwork, CoreRelationship, SecondaryRelationship, HostileRelationship, NeutralAcquaintance, IconicSceneNode } from '../../types/nweos';

export interface RelationshipFieldsProps {
  value: RelationshipNetwork;
  onChange: (value: RelationshipNetwork) => void;
}

function createCoreRelationshipTable(
  container: HTMLElement,
  title: string,
  data: CoreRelationship[],
  onChange: (data: CoreRelationship[]) => void
): void {
  const section = container.createDiv('nweos-form-section');

  const headerEl = section.createDiv('nweos-table-header');
  headerEl.createDiv('nweos-form-section-title').textContent = title;

  const tableEl = section.createDiv('nweos-editable-table nweos-relationship-table');

  const columns = [
    { key: 'character_name', label: '角色名' },
    { key: 'relationship_position', label: '关系定位' },
    { key: 'core_bond', label: '核心羁绊' },
    { key: 'relationship_development_line', label: '关系发展线' },
    { key: 'core_conflict', label: '核心冲突' },
    { key: 'iconic_scene_nodes', label: '名场面' }
  ];

  columns.forEach(col => {
    const colEl = tableEl.createDiv('nweos-table-col');
    colEl.createDiv('nweos-table-col-header').textContent = col.label;
  });
  tableEl.createDiv('nweos-table-col nweos-table-action-col').textContent = '';

  data.forEach((item, index) => {
    const rowEl = tableEl.createDiv('nweos-table-row');

    const nameCell = rowEl.createDiv('nweos-table-cell');
    const nameInput = window.document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = item.character_name || '';
    nameInput.className = 'nweos-table-input';
    nameInput.onchange = () => {
      const newData = [...data];
      newData[index] = { ...newData[index], character_name: nameInput.value };
      onChange(newData);
    };
    nameCell.appendChild(nameInput);

    const posCell = rowEl.createDiv('nweos-table-cell');
    const posInput = window.document.createElement('input');
    posInput.type = 'text';
    posInput.value = item.relationship_position || '';
    posInput.className = 'nweos-table-input';
    posInput.onchange = () => {
      const newData = [...data];
      newData[index] = { ...newData[index], relationship_position: posInput.value };
      onChange(newData);
    };
    posCell.appendChild(posInput);

    const bondCell = rowEl.createDiv('nweos-table-cell');
    const bondInput = window.document.createElement('input');
    bondInput.type = 'text';
    bondInput.value = item.core_bond || '';
    bondInput.className = 'nweos-table-input';
    bondInput.onchange = () => {
      const newData = [...data];
      newData[index] = { ...newData[index], core_bond: bondInput.value };
      onChange(newData);
    };
    bondCell.appendChild(bondInput);

    const devCell = rowEl.createDiv('nweos-table-cell');
    const devInput = window.document.createElement('input');
    devInput.type = 'text';
    devInput.value = item.relationship_development_line || '';
    devInput.className = 'nweos-table-input';
    devInput.onchange = () => {
      const newData = [...data];
      newData[index] = { ...newData[index], relationship_development_line: devInput.value };
      onChange(newData);
    };
    devCell.appendChild(devInput);

    const conflictCell = rowEl.createDiv('nweos-table-cell');
    const conflictInput = window.document.createElement('input');
    conflictInput.type = 'text';
    conflictInput.value = item.core_conflict || '';
    conflictInput.className = 'nweos-table-input';
    conflictInput.onchange = () => {
      const newData = [...data];
      newData[index] = { ...newData[index], core_conflict: conflictInput.value };
      onChange(newData);
    };
    conflictCell.appendChild(conflictInput);

    const sceneCell = rowEl.createDiv('nweos-table-cell');
    const sceneText = item.iconic_scene_nodes?.map(s => s.description).join('; ') || '';
    const sceneInput = window.document.createElement('input');
    sceneInput.type = 'text';
    sceneInput.value = sceneText;
    sceneInput.className = 'nweos-table-input';
    sceneInput.onchange = () => {
      const newData = [...data];
      const scenes = sceneInput.value.split(';').map(s => s.trim()).filter(s => s).map(s => ({ description: s }));
      newData[index] = { ...newData[index], iconic_scene_nodes: scenes };
      onChange(newData);
    };
    sceneCell.appendChild(sceneInput);

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
  addBtn.textContent = '+ 添加核心关系';
  addBtn.className = 'nweos-btn-add';
  addBtn.onclick = () => {
    const newItem: CoreRelationship = {
      character_name: '',
      relationship_position: '',
      core_bond: '',
      relationship_development_line: '',
      core_conflict: '',
      iconic_scene_nodes: []
    };
    onChange([...data, newItem]);
  };
  addRowEl.appendChild(addBtn);
}

function createSimpleRelationshipTable(
  container: HTMLElement,
  title: string,
  data: SecondaryRelationship[] | HostileRelationship[] | NeutralAcquaintance[],
  onChange: (data: any[]) => void,
  extraFields: { key: string; label: string }[] = []
): void {
  const section = container.createDiv('nweos-form-section');

  const headerEl = section.createDiv('nweos-table-header');
  headerEl.createDiv('nweos-form-section-title').textContent = title;

  const tableEl = section.createDiv('nweos-editable-table nweos-relationship-table-simple');

  const baseColumns = [
    { key: 'character_name', label: '角色名' },
    { key: 'relationship_position', label: '关系定位' }
  ];

  [...baseColumns, ...extraFields].forEach(col => {
    const colEl = tableEl.createDiv('nweos-table-col');
    colEl.createDiv('nweos-table-col-header').textContent = col.label;
  });
  tableEl.createDiv('nweos-table-col nweos-table-action-col').textContent = '';

  data.forEach((item, index) => {
    const rowEl = tableEl.createDiv('nweos-table-row');

    const nameCell = rowEl.createDiv('nweos-table-cell');
    const nameInput = window.document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = item.character_name || '';
    nameInput.className = 'nweos-table-input';
    nameInput.onchange = () => {
      const newData = [...data];
      newData[index] = { ...newData[index], character_name: nameInput.value };
      onChange(newData);
    };
    nameCell.appendChild(nameInput);

    const posCell = rowEl.createDiv('nweos-table-cell');
    const posInput = window.document.createElement('input');
    posInput.type = 'text';
    posInput.value = item.relationship_position || '';
    posInput.className = 'nweos-table-input';
    posInput.onchange = () => {
      const newData = [...data];
      newData[index] = { ...newData[index], relationship_position: posInput.value };
      onChange(newData);
    };
    posCell.appendChild(posInput);

    extraFields.forEach(field => {
      const cell = rowEl.createDiv('nweos-table-cell');
      const input = window.document.createElement('input');
      input.type = 'text';
      input.value = (item as any)[field.key] || '';
      input.className = 'nweos-table-input';
      input.onchange = () => {
        const newData = [...data];
        newData[index] = { ...newData[index], [field.key]: input.value };
        onChange(newData);
      };
      cell.appendChild(input);
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
  addBtn.textContent = `+ 添加${title}`;
  addBtn.className = 'nweos-btn-add';
  addBtn.onclick = () => {
    const newItem: Record<string, any> = {
      character_name: '',
      relationship_position: ''
    };
    extraFields.forEach(f => {
      newItem[f.key] = '';
    });
    onChange([...data, newItem]);
  };
  addRowEl.appendChild(addBtn);
}

export function renderRelationshipFields(container: HTMLElement, props: RelationshipFieldsProps): void {
  const { value, onChange } = props;

  createCoreRelationshipTable(
    container,
    '核心关系',
    value.core_relationships,
    (newData) => onChange({ ...value, core_relationships: newData })
  );

  createSimpleRelationshipTable(
    container,
    '次要关系',
    value.secondary_relationships,
    (newData) => onChange({ ...value, secondary_relationships: newData }),
    [{ key: 'core_bond', label: '核心羁绊' }]
  );

  createSimpleRelationshipTable(
    container,
    '敌对关系',
    value.hostile_relationships,
    (newData) => onChange({ ...value, hostile_relationships: newData }),
    [{ key: 'reason', label: '敌对原因' }]
  );

  createSimpleRelationshipTable(
    container,
    '中立关系',
    value.neutral_acquaintances,
    (newData) => onChange({ ...value, neutral_acquaintances: newData }),
    [{ key: 'note', label: '备注' }]
  );
}
