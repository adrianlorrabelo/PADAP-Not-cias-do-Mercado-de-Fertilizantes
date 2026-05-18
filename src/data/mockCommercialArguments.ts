import type { CommercialArgument } from "../types";

export const mockCommercialArguments: CommercialArgument[] = [
  { id: "arg-ptax-up", category: "PTAX subindo", argument: "Como os fertilizantes tem forte influencia do câmbio, a validade das cotações está mais curta. O ideal e travar a condição enquanto o preço está confirmado." },
  { id: "arg-ptax-down", category: "PTAX caindo", argument: "O câmbio deu algum alívio, mas a recomendação e confirmar disponibilidade e validade antes de postergar a decisão de compra." },
  { id: "arg-trade-up", category: "Relação de troca melhorando", argument: "A relação de troca melhorou, então o produtor precisa entregar menos produto para comprar o mesmo volume de fertilizante. É uma janela interessante para planejamento." },
  { id: "arg-trade-down", category: "Relação de troca piorando", argument: "A relação de troca ficou menos favorável. Antecipar decisão pode evitar comprar em uma condição ainda mais pressionada." },
  { id: "arg-specialty", category: "Especialidade x commodity", argument: "Apesar do maior valor por tonelada, a especialidade entrega maior uniformidade, qualidade de formulação e segurança nutricional, reduzindo risco operacional no campo." },
  { id: "arg-urea", category: "Ureia em alta", argument: "A ureia está volátil. Antes de assumir uma condição antiga, vale confirmar preço e disponibilidade para proteger margem e prazo de entrega." },
  { id: "arg-kcl", category: "KCl em oportunidade", argument: "O KCl abriu uma janela de oportunidade. Para quem tem demanda de potássio, este e um bom momento para avaliar volume e compor pacote." },
  { id: "arg-validity", category: "Validade curta da proposta", argument: "A validade curta protege o produtor e a PADAP em um mercado de câmbio e fertilizantes oscilando durante o dia." },
  { id: "arg-factory", category: "Disponibilidade de fábrica", argument: "Mesmo com preço confirmado, a disponibilidade precisa ser reconfirmada para garantir entrega no prazo comercial combinado." },
  { id: "arg-crop-plan", category: "Planejamento de safra", argument: "Planejar agora reduz o risco de comprar em janela apertada, com frete pressionado ou produto indisponível." }
];
