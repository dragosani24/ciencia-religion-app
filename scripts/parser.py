import fitz  # PyMuPDF
import re

def clean_text(text):
    """Limpia saltos de línea innecesarios y espacios extra."""
    text = text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_book_content(pdf_path):
    doc = fitz.open(pdf_path)
    full_content = ""

    # 1. Extraer todo el texto del PDF
    for page in doc:
        full_content += page.get_text("text") + "\n"

    # 2. Expresión regular para detectar Capítulos (ej: CAPÍTULO I, CAPÍTULO II...)
    # Basado en el índice del libro de 1897
    chapter_regex = r'(CAPÍTULO\s+[I|V|X|L|C]+[^\n]*)'
    
    # Dividir el contenido por capítulos
    parts = re.split(chapter_regex, full_content)
    
    chapters_data = []
    
    # El primer elemento de 'parts' suele ser el prólogo/introducción
    if parts[0].strip():
        chapters_data.append({
            "title": "INTRODUCCIÓN Y PRÓLOGO",
            "content": parts[0]
        })

    # Emparejar títulos con sus contenidos
    for i in range(1, len(parts), 2):
        title = parts[i].strip()
        content = parts[i+1] if (i+1) < len(parts) else ""
        chapters_data.append({
            "title": title,
            "content": content
        })

    return chapters_data

def generate_sql(chapters_data, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- Datos generados automáticamente del PDF\n")
        f.write("USE ciencia_religion_db;\n\n")

        for c_idx, chapter in enumerate(chapters_data, 1):
            # Insertar Capítulo
            safe_title = chapter['title'].replace("'", "''")
            f.write(f"INSERT INTO chapters (id, title) VALUES ({c_idx}, '{safe_title}');\n")
            
            # Dividir contenido en párrafos (usando doble salto de línea o longitud mínima)
            # En el PDF original, los párrafos suelen ser bloques densos
            paragraphs = re.split(r'\n\s*\n', chapter['content'])
            
            for p_idx, para in enumerate(paragraphs):
                clean_para = clean_text(para)
                
                # Omitir párrafos vacíos o muy cortos (ruido de escaneo)
                if len(clean_para) > 60:
                    safe_para = clean_para.replace("'", "''")
                    f.write(f"INSERT INTO paragraphs (chapter_id, content) VALUES ({c_idx}, '{safe_para}');\n")
            
            f.write("\n")

if __name__ == "__main__":
    pdf_file = "ciencia_y_religion_modificado_directo.pdf"
    sql_output = "init_data.sql"
    
    print(f"Procesando {pdf_file}...")
    data = extract_book_content(pdf_file)
    generate_sql(data, sql_output)
    print(f"Éxito. Se ha creado {sql_output}. Cárgalo en tu MySQL para poblar la red social.")