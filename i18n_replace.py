import os
import re
import glob

def refactor_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if not a file with hardcoded strings we want to replace or if already fully translated (assuming it has imports)
    if 'useTranslation' not in content:
        # Add import at the top
        content = 'import { useTranslation } from "react-i18next";\n' + content
        
    # Check if const { t } = useTranslation(); is missing inside the component
    # We will just do a simple replacement if we find the component definition
    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export const \w+: React\.FC.*?\s*=\s*\([^)]*\)\s*=>\s*\{)', r'\1\n    const { t } = useTranslation();\n', content)

    # Some basic search and replace pairs:
    replacements = [
        # ProducerAudience
        (r'reg.visitor\?\.name \|\| reg\.guestName \|\| "Visitante"', r'reg.visitor?.name || reg.guestName || t("producer.audience.visitor", "Visitante")'),
        (r'reg\.event\?\.title \|\| "Evento Desconhecido"', r'reg.event?.title || t("producer.audience.unknown_event", "Evento Desconhecido")'),
        (r'reg\.ticket\?\.name \|\| "Ingresso"', r'reg.ticket?.name || t("producer.audience.ticket", "Ingresso")'),
        (r'>Exportar CSV<', r'>{t("producer.audience.export_csv", "Exportar CSV")}<'),
        (r'placeholder="Buscar por nome ou email\.\.\."', r'placeholder={t("producer.audience.search_placeholder", "Buscar por nome ou email...")}'),
        (r'<div className="col-span-4">Nome</div>', r'<div className="col-span-4">{t("producer.audience.name", "Nome")}</div>'),
        (r'<div className="col-span-3">Evento</div>', r'<div className="col-span-3">{t("producer.audience.event", "Evento")}</div>'),
        (r'<div className="col-span-2">Ingresso</div>', r'<div className="col-span-2">{t("producer.audience.ticket", "Ingresso")}</div>'),
        (r'<div className="col-span-2">Status</div>', r'<div className="col-span-2">{t("producer.audience.status", "Status")}</div>'),
        (r'>Carregando\.\.\.<', r'>{t("common.loading", "Carregando...")}<'),
        (r'>Nenhum participante encontrado\.<', r'>{t("producer.audience.no_participants", "Nenhum participante encontrado.")}<'),
        (r'\? "PRESENTE" : "CONFIRMADO"', r'? t("producer.audience.present", "PRESENTE") : t("producer.audience.confirmed", "CONFIRMADO")'),
        
        # We can add more for other files as we find them...
    ]
    
    for old, new in replacements:
        content = re.sub(old, new, content)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Script initialized.")
