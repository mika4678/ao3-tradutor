import os
import zipfile
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator

# Procura o arquivo .epub enviado no repositório
def find_epub():
    for file in os.listdir('.'):
        if file.endswith('.epub') and not file.startswith('translated_'):
            return file
    return None

def translate_html_content(html_content, target_lang='pt'):
    soup = BeautifulSoup(html_content, 'html.parser')
    # Configurado especificamente para Português do Brasil
    translator = GoogleTranslator(source='auto', target=target_lang)

    for element in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'span', 'li']):
        if element.string and element.string.strip():
            try:
                translated_text = translator.translate(element.string)
                if translated_text:
                    element.string.replace_with(translated_text)
            except Exception as e:
                print(f"Erro ao traduzir trecho: {e}")
    
    return str(soup)

def process_epub(input_path, output_path):
    print(f"Iniciando tradução para Português do Brasil: {input_path}...")
    temp_dir = 'temp_epub'
    
    # Extrai o arquivo EPUB
    with zipfile.ZipFile(input_path, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)

    # Varre os arquivos HTML/XHTML internos e traduz o texto
    for root, _, files in os.walk(temp_dir):
        for file in files:
            if file.endswith(('.html', '.xhtml', '.htm')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                # 'pt' no Google Translator mapeia automaticamente para Português
                translated_content = translate_html_content(content, target_lang='pt')
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(translated_content)

    # Empacota novamente como um novo EPUB
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zip_out:
        for root, _, files in os.walk(temp_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, temp_dir)
                zip_out.write(full_path, rel_path)

    print(f"Livro em Português gerado com sucesso: {output_path}")

if __name__ == '__main__':
    epub_file = find_epub()
    if epub_file:
        output_file = f"pt_BR_{epub_file}"
        process_epub(epub_file, output_file)
    else:
        print("Nenhum arquivo .epub encontrado para traduzir!")
                  
