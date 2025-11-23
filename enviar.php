<?php
// Configurações básicas
$destino = "periclescep@gmail.com"; // troque depois pelo e-mail oficial
$assunto_prefixo = "[Ouvidori SISPREV] ";

// Bloqueia métodos que não sejam POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit('Método não permitido.');
}

// Honeypot (campo oculto deve ficar vazio)
if (!empty($_POST['website'])) {
  http_response_code(403);
  exit('Ação não permitida.');
}

// Sanitização
function s($k, $default=''){ return isset($_POST[$k]) ? trim(strip_tags($_POST[$k])) : $default; }
$tipo   = s('tipo');
$setor  = s('setor');
$ident  = s('identificacao','sim');
$nome   = s('nome');
$cpfmat = s('cpfmat');
$email  = filter_var(s('email'), FILTER_VALIDATE_EMAIL) ? s('email') : '';
$tel    = s('telefone');
$assunto= s('assunto','Manifestação');
$desc   = isset($_POST['descricao']) ? trim($_POST['descricao']) : '';
$lgpd   = isset($_POST['lgpd']);
$vera   = isset($_POST['veracidade']);
$datahr = s('datahora');
$origem = s('origem','ouvidori.html');

// Regras de obrigatórios
$erros = [];
if (!$tipo) $erros[] = "Tipo de manifestação é obrigatório.";
if (!$assunto) $erros[] = "Assunto é obrigatório.";
if (!$desc) $erros[] = "Descrição é obrigatória.";
if (!$lgpd) $erros[] = "É necessário aceitar o aviso de privacidade.";
if (!$vera) $erros[] = "É necessário confirmar veracidade.";
if ($ident !== 'nao') { // identificado
  if (!$nome)  $erros[] = "Nome é obrigatório para envio identificado.";
  if (!$email) $erros[] = "E-mail válido é obrigatório para envio identificado.";
}
if ($erros) {
  http_response_code(422);
  echo "Não foi possível enviar:\n- " . implode("\n- ", $erros);
  exit;
}

// Monta corpo de texto
$texto  = "Protocolo: $datahr\nOrigem: $origem\nIP: " . ($_SERVER['REMOTE_ADDR'] ?? 'n/d') . "\n\n";
$texto .= "Tipo: $tipo\nSetor: " . ($setor ?: 'n/d') . "\nIdentificação: " . ($ident === 'nao' ? 'Anônimo' : 'Identificado') . "\n";
if ($ident !== 'nao') {
  $texto .= "Nome: $nome\nEmail: $email\nTelefone: " . ($tel ?: 'n/d') . "\nCPF/Matrícula: " . ($cpfmat ?: 'n/d') . "\n";
}
$texto .= "\nAssunto: $assunto\n\nDescrição:\n$desc\n";

// ---------- envio com (possíveis) anexos ----------
$limite_total = 10 * 1024 * 1024; // 10MB
$tipos_ok = ['pdf','jpg','jpeg','png','doc','docx','odt'];
$total = 0;
$temAnexo = isset($_FILES['anexos']) && is_array($_FILES['anexos']['name']);

$boundary = "==SISPREV_" . md5(uniqid(time(), true));
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "From: SISPREV Ouvidori <nao-responda@sisprevto.mg.gov.br>\r\n";
if ($email) $headers .= "Reply-To: $email\r\n";

if ($temAnexo) {
  // checa e prepara anexos
  $partes = [];
  $partes[] = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n$texto\r\n";

  $n = count($_FILES['anexos']['name']);
  for ($i=0; $i<$n; $i++) {
    if ($_FILES['anexos']['error'][$i] !== UPLOAD_ERR_OK) continue;
    $nomeArq = $_FILES['anexos']['name'][$i];
    $tmp     = $_FILES['anexos']['tmp_name'][$i];
    $tam     = (int) $_FILES['anexos']['size'][$i];

    $ext = strtolower(pathinfo($nomeArq, PATHINFO_EXTENSION));
    if (!in_array($ext, $tipos_ok)) continue;

    $total += $tam;
    if ($total > $limite_total) {
      http_response_code(413);
      exit("Tamanho total de anexos excede 10MB.");
    }

    $data = chunk_split(base64_encode(file_get_contents($tmp)));
    $ctype = mime_content_type($tmp) ?: "application/octet-stream";
    $partes[] = "--$boundary\r\nContent-Type: $ctype; name=\"$nomeArq\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$nomeArq\"\r\n\r\n$data\r\n";
  }
  $partes[] = "--$boundary--";

  $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
  $mensagem = implode('', $partes);

} else {
  // sem anexo
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
  $mensagem = $texto;
}

// Envia
$ok = mail($destino, $assunto_prefixo.$assunto, $mensagem, $headers);

// Resposta simples
if ($ok) {
  echo "Manifestação enviada com sucesso. Em breve você receberá retorno.";
} else {
  http_response_code(500);
  echo "Falha ao enviar. Tente novamente mais tarde.";
}
