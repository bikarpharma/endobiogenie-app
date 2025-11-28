// Test direct du RAG
// Usage: node scripts/test-rag-direct.js

async function testRAG() {
  console.log('=== TEST RAG DIRECT ===\n');

  try {
    // Import dynamique
    const { Agent, fileSearchTool, Runner } = await import('@openai/agents');
    console.log('✅ @openai/agents importé');

    // Vectorstores IDs
    const VECTORSTORES = {
      endobiogenie: "vs_68e87a07ae6c81918d805c8251526bda",
      phyto: "vs_68feb856fedc81919ef239741143871e",
      gemmo: "vs_68fe63bee4bc8191b2ab5e6813d5bed2",
      aroma: "vs_68feabf4185c8191afbadcc2cfe972a7",
    };

    // Test 1: Endobiogénie
    console.log('\n--- Test Vectorstore ENDOBIOGÉNIE ---');
    const fileSearchEndo = fileSearchTool([VECTORSTORES.endobiogenie]);

    const agentEndo = new Agent({
      name: 'endo-agent',
      model: 'gpt-4o-mini',
      instructions: 'Tu es un expert en endobiogénie. Réponds en français avec les plantes recommandées.',
      tools: [fileSearchEndo],
    });

    const runner = new Runner();
    console.log('🔍 Recherche drainage hépatique...');

    const resultEndo = await runner.run(agentEndo, [
      { role: 'user', content: [{ type: 'input_text', text: 'Quelles plantes pour le drainage hépatique en endobiogénie selon Lapraz? Donne 3-5 plantes avec posologie.' }] },
    ]);

    console.log('\n=== RÉSULTAT ENDOBIOGÉNIE ===');
    console.log(resultEndo.finalOutput ? resultEndo.finalOutput.substring(0, 800) : 'PAS DE RÉSULTAT');

    // Test 2: Phytothérapie
    console.log('\n--- Test Vectorstore PHYTO ---');
    const fileSearchPhyto = fileSearchTool([VECTORSTORES.phyto]);

    const agentPhyto = new Agent({
      name: 'phyto-agent',
      model: 'gpt-4o-mini',
      instructions: 'Tu es un expert en phytothérapie clinique. Réponds en français.',
      tools: [fileSearchPhyto],
    });

    console.log('🔍 Recherche plantes adaptogènes...');

    const resultPhyto = await runner.run(agentPhyto, [
      { role: 'user', content: [{ type: 'input_text', text: 'Quelles plantes adaptogènes pour le stress chronique? Donne les posologies EPS.' }] },
    ]);

    console.log('\n=== RÉSULTAT PHYTO ===');
    console.log(resultPhyto.finalOutput ? resultPhyto.finalOutput.substring(0, 800) : 'PAS DE RÉSULTAT');

    console.log('\n✅ Test RAG terminé avec succès!');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

testRAG();
