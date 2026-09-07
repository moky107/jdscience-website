-- Metadata corrections for misclassified resources.
-- Review docs/resource-catalogue-audit.md before applying. Does NOT delete rows or files.

BEGIN;

-- id 56: JDScience_GCSE_Biology_Topic1_FINAL
UPDATE resources SET title = 'JDScience Biology topic 1: Cell biology' WHERE id = 56;

-- id 57: JDScience_C6_Rate_and_Extent
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience Chemistry topic 6: Rate and extent' WHERE id = 57;

-- id 58: JDScience_C5_Energy_Changes
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience Chemistry topic 5: Energy changes' WHERE id = 58;

-- id 59: JDScience_C4_Chemical_Changes
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience Chemistry topic 4: Chemical changes' WHERE id = 59;

-- id 60: JDScience_C3_Quantitative_Chemistry
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience Chemistry topic 3: Quantitative chemistry' WHERE id = 60;

-- id 61: JDScience_C2_Bonding_Structure
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience Chemistry topic 2: Bonding and structure' WHERE id = 61;

-- id 62: JDScience_C8_Chemical_Analysis
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience Chemistry topic 8: Chemical analysis' WHERE id = 62;

-- id 63: JDScience_C9_Chemistry_of_the_Atmosphere
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience Chemistry topic 9: Atmosphere' WHERE id = 63;

-- id 64: JDScience_C7_Organic_Chemistry (1)
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience Chemistry topic 7: Organic chemistry' WHERE id = 64;

-- id 70: JDScience_AQA_GCSE_Physics_1_Energy (1)
UPDATE resources SET title = 'JDScience Physics topic 1: Energy' WHERE id = 70;

-- id 71: JDScience_AQA_GCSE_Physics_6_Waves
UPDATE resources SET title = 'JDScience Physics topic 6: Waves' WHERE id = 71;

-- id 72: JDScience_AQA_GCSE_Physics_5_Forces
UPDATE resources SET title = 'JDScience Physics topic 5: Forces' WHERE id = 72;

-- id 73: JDScience_AQA_GCSE_Physics_3_Particle_Model_of_Matter
UPDATE resources SET title = 'JDScience Physics topic 3: Particle model' WHERE id = 73;

-- id 74: JDScience_AQA_GCSE_Physics_2_Electricity
UPDATE resources SET title = 'JDScience Physics topic 2: Electricity' WHERE id = 74;

-- id 75: JDScience_AQA_GCSE_Physics_1_Energy (1)
UPDATE resources SET title = 'JDScience Physics topic 1: Energy' WHERE id = 75;

-- id 76: JDScience_AQA_GCSE_Physics_6_Waves
UPDATE resources SET title = 'JDScience Physics topic 6: Waves' WHERE id = 76;

-- id 77: JDScience_AQA_GCSE_Physics_5_Forces
UPDATE resources SET title = 'JDScience Physics topic 5: Forces' WHERE id = 77;

-- id 78: JDScience_AQA_GCSE_Physics_3_Particle_Model_of_Matter
UPDATE resources SET title = 'JDScience Physics topic 3: Particle model' WHERE id = 78;

-- id 79: JDScience_AQA_GCSE_Physics_2_Electricity
UPDATE resources SET title = 'JDScience Physics topic 2: Electricity' WHERE id = 79;

-- id 80: JDScience_AQA_GCSE_Physics_1_Energy (1)
UPDATE resources SET exam_board = 'AQA', title = 'JDScience Physics topic 1: Energy' WHERE id = 80;

-- id 81: JDScience_AQA_GCSE_Physics_6_Waves
UPDATE resources SET exam_board = 'AQA', title = 'JDScience Physics topic 6: Waves' WHERE id = 81;

-- id 82: JDScience_AQA_GCSE_Physics_5_Forces
UPDATE resources SET exam_board = 'AQA', title = 'JDScience Physics topic 5: Forces' WHERE id = 82;

-- id 83: JDScience_AQA_GCSE_Physics_3_Particle_Model_of_Matter
UPDATE resources SET exam_board = 'AQA', title = 'JDScience Physics topic 3: Particle model' WHERE id = 83;

-- id 84: JDScience_AQA_GCSE_Physics_2_Electricity
UPDATE resources SET exam_board = 'AQA', title = 'JDScience Physics topic 2: Electricity' WHERE id = 84;

-- id 85: JDScience_AQA_GCSE_Physics_1_Energy (1)
UPDATE resources SET exam_board = 'AQA', title = 'JDScience Physics topic 1: Energy' WHERE id = 85;

-- id 86: JDScience_AQA_GCSE_Physics_6_Waves
UPDATE resources SET exam_board = 'AQA', title = 'JDScience Physics topic 6: Waves' WHERE id = 86;

-- id 87: JDScience_AQA_GCSE_Physics_5_Forces
UPDATE resources SET exam_board = 'AQA', title = 'JDScience Physics topic 5: Forces' WHERE id = 87;

-- id 88: JDScience_AQA_GCSE_Physics_3_Particle_Model_of_Matter
UPDATE resources SET exam_board = 'AQA', title = 'JDScience Physics topic 3: Particle model' WHERE id = 88;

-- id 89: JDScience_AQA_GCSE_Physics_2_Electricity
UPDATE resources SET exam_board = 'AQA', title = 'JDScience Physics topic 2: Electricity' WHERE id = 89;

-- id 91: JDScience%20GCSE%20Physics%20-%20Electricity(2)
UPDATE resources SET title = 'JDScience Physics topic 2: Electricity' WHERE id = 91;

-- id 92: JDScience_GCSE_Physics_6_Waves
UPDATE resources SET title = 'JDScience Physics topic 6: Waves' WHERE id = 92;

-- id 93: JDScience%20GCSE%20Physics%20-%20Atomic%20Structure
UPDATE resources SET title = 'JDScience Physics topic 4: Atomic structure' WHERE id = 93;

-- id 94: JDScience%20GCSE%20Physics%20-%20Particle%20Model%20of%20Matter
UPDATE resources SET title = 'JDScience Physics topic 3: Particle model' WHERE id = 94;

-- id 95: JDScience%20GCSE%20Physics%20-%20Particle%20Model%20of%20Matter
UPDATE resources SET title = 'JDScience Physics topic 3: Particle model' WHERE id = 95;

-- id 98: JDScience%20GCSE%20Physics%20-%20Electricity(2)
UPDATE resources SET title = 'JDScience Physics topic 2: Electricity' WHERE id = 98;

-- id 99: JDScience_GCSE_Physics_6_Waves
UPDATE resources SET title = 'JDScience Physics topic 6: Waves' WHERE id = 99;

-- id 100: JDScience%20GCSE%20Physics%20-%20Atomic%20Structure
UPDATE resources SET title = 'JDScience Physics topic 4: Atomic structure' WHERE id = 100;

-- id 101: JDScience%20GCSE%20Physics%20-%20Particle%20Model%20of%20Matter
UPDATE resources SET title = 'JDScience Physics topic 3: Particle model' WHERE id = 101;

-- id 104: JDScience%20GCSE%20Physics%20-%20Electricity(2)
UPDATE resources SET title = 'JDScience Physics topic 2: Electricity' WHERE id = 104;

-- id 105: JDScience_GCSE_Physics_6_Waves
UPDATE resources SET title = 'JDScience Physics topic 6: Waves' WHERE id = 105;

-- id 106: JDScience%20GCSE%20Physics%20-%20Atomic%20Structure
UPDATE resources SET title = 'JDScience Physics topic 4: Atomic structure' WHERE id = 106;

-- id 107: JDScience%20GCSE%20Physics%20-%20Particle%20Model%20of%20Matter
UPDATE resources SET title = 'JDScience Physics topic 3: Particle model' WHERE id = 107;

-- id 108: JDScience_GCSE_Physics_Forces_Modules_10_11
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 10-11' WHERE id = 108;

-- id 109: JDScience_GCSE_Physics_Forces_Modules_6_9
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 6-9' WHERE id = 109;

-- id 110: JDScience_GCSE_Physics_Forces_Modules_3_5
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 3-5' WHERE id = 110;

-- id 111: JDScience_GCSE_Physics_Forces_Modules_1_2
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 1-2' WHERE id = 111;

-- id 112: JDScience_GCSE_Physics_Atomic_Structure_Modules_10_11
UPDATE resources SET title = 'JDScience worksheet — Physics: Atomic Structure Modules 10-11' WHERE id = 112;

-- id 113: JDScience_GCSE_Physics_Atomic_Structure_Modules_6_9
UPDATE resources SET title = 'JDScience worksheet — Physics: Atomic Structure Modules 6-9' WHERE id = 113;

-- id 114: JDScience_GCSE_Physics_Atomic_Structure_Modules_3_5
UPDATE resources SET title = 'JDScience worksheet — Physics: Atomic Structure Modules 3-5' WHERE id = 114;

-- id 115: JDScience_GCSE_Physics_Atomic_Structure_Modules_1_2
UPDATE resources SET title = 'JDScience worksheet — Physics: Atomic Structure Modules 1-2' WHERE id = 115;

-- id 116: JDScience_GCSE_Physics_Electricity_Modules_7_9
UPDATE resources SET title = 'JDScience worksheet — Physics: Electricity Modules 7-9' WHERE id = 116;

-- id 117: JDScience_GCSE_Physics_Electricity_Modules_4_6
UPDATE resources SET title = 'JDScience worksheet — Physics: Electricity Modules 4-6' WHERE id = 117;

-- id 118: JDScience_GCSE_Physics_Electricity_Modules_2_3
UPDATE resources SET title = 'JDScience worksheet — Physics: Electricity Modules 2-3' WHERE id = 118;

-- id 119: JDScience_Energy_Module_5_Fill_in_the_Blanks
UPDATE resources SET title = 'JDScience worksheet — Physics: Energy Modules 5 Fill in the Blanks' WHERE id = 119;

-- id 120: JDScience_GCSE_Physics_Forces_Modules_10_11
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 10-11' WHERE id = 120;

-- id 121: JDScience_GCSE_Physics_Forces_Modules_6_9
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 6-9' WHERE id = 121;

-- id 122: JDScience_GCSE_Physics_Forces_Modules_3_5
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 3-5' WHERE id = 122;

-- id 123: JDScience_GCSE_Physics_Forces_Modules_1_2
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 1-2' WHERE id = 123;

-- id 124: JDScience_GCSE_Physics_Atomic_Structure_Modules_10_11
UPDATE resources SET title = 'JDScience worksheet — Physics: Atomic Structure Modules 10-11' WHERE id = 124;

-- id 125: JDScience_GCSE_Physics_Atomic_Structure_Modules_6_9
UPDATE resources SET title = 'JDScience worksheet — Physics: Atomic Structure Modules 6-9' WHERE id = 125;

-- id 126: JDScience_GCSE_Physics_Atomic_Structure_Modules_3_5
UPDATE resources SET title = 'JDScience worksheet — Physics: Atomic Structure Modules 3-5' WHERE id = 126;

-- id 127: JDScience_GCSE_Physics_Atomic_Structure_Modules_1_2
UPDATE resources SET title = 'JDScience worksheet — Physics: Atomic Structure Modules 1-2' WHERE id = 127;

-- id 128: JDScience_GCSE_Physics_Electricity_Modules_10_11
UPDATE resources SET title = 'JDScience worksheet — Physics: Electricity Modules 10-11' WHERE id = 128;

-- id 129: JDScience_GCSE_Physics_Electricity_Modules_7_9
UPDATE resources SET title = 'JDScience worksheet — Physics: Electricity Modules 7-9' WHERE id = 129;

-- id 130: JDScience_GCSE_Physics_Electricity_Modules_2_3
UPDATE resources SET title = 'JDScience worksheet — Physics: Electricity Modules 2-3' WHERE id = 130;

-- id 131: JDScience_Energy_Module_5_Fill_in_the_Blanks (1)
UPDATE resources SET title = 'JDScience worksheet — Physics: Energy Modules 5 Fill in the Blanks' WHERE id = 131;

-- id 132: JDScience_GCSE_Physics_Topic_1_Energy_Master_Workbook_v1
UPDATE resources SET title = 'JDScience worksheet — Physics: Topic 1 Energy Master Workbook' WHERE id = 132;

-- id 133: JDScience_GCSE_Physics_Forces_Modules_10_11
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 10-11' WHERE id = 133;

-- id 134: JDScience_GCSE_Physics_Forces_Modules_6_9
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 6-9' WHERE id = 134;

-- id 135: JDScience_GCSE_Physics_Forces_Modules_3_5
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 3-5' WHERE id = 135;

-- id 136: JDScience_GCSE_Physics_Forces_Modules_1_2
UPDATE resources SET title = 'JDScience worksheet — Physics: Forces Modules 1-2' WHERE id = 136;

-- id 137: JDScience_GCSE_Physics_Atomic_Structure_Modules_10_11
UPDATE resources SET title = 'JDScience worksheet — Physics: Atomic Structure Modules 10-11' WHERE id = 137;

-- id 138: JDScience_GCSE_Physics_Atomic_Structure_Modules_6_9
UPDATE resources SET title = 'JDScience worksheet — Physics: Atomic Structure Modules 6-9' WHERE id = 138;

-- id 139: JDScience_GCSE_Physics_Space_Physics_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Space Physics Revision' WHERE id = 139;

-- id 140: JDScience_GCSE_Physics_Magnetism_Electromagnetism_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Magnetism Electromagnetism Revision' WHERE id = 140;

-- id 141: JDScience_GCSE_Physics_Waves_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Waves Revision' WHERE id = 141;

-- id 142: JDScience_GCSE_Physics_Space_Physics_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Space Physics Revision' WHERE id = 142;

-- id 143: JDScience_GCSE_Physics_Magnetism_Electromagnetism_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Magnetism Electromagnetism Revision' WHERE id = 143;

-- id 144: JDScience_GCSE_Physics_Waves_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Waves Revision' WHERE id = 144;

-- id 145: JDScience_GCSE_Physics_Space_Physics_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Space Physics Revision' WHERE id = 145;

-- id 146: JDScience_GCSE_Physics_Magnetism_Electromagnetism_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Magnetism Electromagnetism Revision' WHERE id = 146;

-- id 147: JDScience_GCSE_Physics_Waves_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Waves Revision' WHERE id = 147;

-- id 148: JDScience_GCSE_Physics_Space_Physics_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Space Physics Revision' WHERE id = 148;

-- id 149: JDScience_GCSE_Physics_Magnetism_Electromagnetism_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Magnetism Electromagnetism Revision' WHERE id = 149;

-- id 150: JDScience_GCSE_Physics_Waves_Revision_Worksheet
UPDATE resources SET title = 'JDScience worksheet — Physics: Waves Revision' WHERE id = 150;

-- id 274: JDScience_Edexcel_GCSE_Chemistry_Topic_1_Key_Concepts_Notes
UPDATE resources SET title = 'JDScience revision notes — Edexcel GCSE Chemistry Topic 1: Key concepts' WHERE id = 274;

-- id 275: jdscience_topic2_states_of_matter_and_mixtures (1)
UPDATE resources SET title = 'JDScience revision notes — Edexcel GCSE Chemistry Topic 2: States of matter' WHERE id = 275;

-- id 276: JDScience_Edexcel_GCSE_Chemistry_Topic_3_Chemical_Changes_Notes (1)
UPDATE resources SET title = 'JDScience revision notes — Edexcel GCSE Chemistry Topic 3: Chemical changes' WHERE id = 276;

-- id 277: JDScience_Edexcel_GCSE_Chemistry_Topic_4_Extracting_Metals_and_Equilibria_Notes
UPDATE resources SET title = 'JDScience revision notes — Edexcel GCSE Chemistry Topic 4: Extracting metals' WHERE id = 277;

-- id 278: JDScience_Edexcel_GCSE_Chemistry_Topic_5_Separate_Chemistry_1_Notes
UPDATE resources SET title = 'JDScience revision notes — Edexcel GCSE Chemistry Topic 5: Separate chemistry 1' WHERE id = 278;

-- id 279: jdscience_topic6_groups_in_the_periodic_table
UPDATE resources SET title = 'JDScience revision notes — Edexcel GCSE Chemistry Topic 6: Periodic table groups' WHERE id = 279;

-- id 280: jdscience_topic8_fuels_and_earth_science
UPDATE resources SET title = 'JDScience revision notes — Edexcel GCSE Chemistry Topic 8: Fuels and earth science' WHERE id = 280;

-- id 281: jdscience_topic9_separate_chemistry_2
UPDATE resources SET title = 'JDScience revision notes — Edexcel GCSE Chemistry Topic 9: Separate chemistry 2' WHERE id = 281;

-- id 282: Topic9_Separate_Chemistry_2_Worksheet
UPDATE resources SET title = 'Edexcel GCSE Chemistry Topic 9: Separate chemistry 2' WHERE id = 282;

-- id 283: Topic7_Rates_and_Energy_Changes_Worksheet
UPDATE resources SET title = 'Edexcel GCSE Chemistry Topic 7: Rates and energy changes' WHERE id = 283;

-- id 284: Topic6_Groups_in_the_Periodic_Table_Worksheet
UPDATE resources SET title = 'Edexcel GCSE Chemistry Topic 6: Periodic table groups' WHERE id = 284;

-- id 285: Topic5_Separate_Chemistry_1_Worksheet
UPDATE resources SET title = 'Edexcel GCSE Chemistry Topic 5: Separate chemistry 1' WHERE id = 285;

-- id 286: Topic4_Extracting_Metals_and_Equilibria_Worksheet
UPDATE resources SET title = 'Edexcel GCSE Chemistry Topic 4: Extracting metals' WHERE id = 286;

-- id 287: Topic3_Chemical_Changes_Worksheet
UPDATE resources SET title = 'Edexcel GCSE Chemistry Topic 3: Chemical changes' WHERE id = 287;

-- id 288: Topic2_States_of_Matter_and_Mixtures_Worksheet
UPDATE resources SET title = 'Edexcel GCSE Chemistry Topic 2: States of matter' WHERE id = 288;

-- id 289: Topic4_Extracting_Metals_and_Equilibria_Worksheet
UPDATE resources SET title = 'Edexcel GCSE Chemistry Topic 4: Extracting metals' WHERE id = 289;

-- id 290: Topic9_Separate_Chemistry_2_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 9: Separate chemistry 2' WHERE id = 290;

-- id 291: Topic7_Rates_and_Energy_Changes_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 7: Rates and energy changes' WHERE id = 291;

-- id 292: Topic6_Groups_in_the_Periodic_Table_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 6: Periodic table groups' WHERE id = 292;

-- id 293: Topic5_Separate_Chemistry_1_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 5: Separate chemistry 1' WHERE id = 293;

-- id 294: Topic4_Extracting_Metals_and_Equilibria_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 4: Extracting metals' WHERE id = 294;

-- id 295: Topic4_Extracting_Metals_and_Equilibria_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 4: Extracting metals' WHERE id = 295;

-- id 296: Topic3_Chemical_Changes_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 3: Chemical changes' WHERE id = 296;

-- id 297: Topic2_States_of_Matter_and_Mixtures_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 2: States of matter' WHERE id = 297;

-- id 298: Topic9_Separate_Chemistry_2_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 9: Separate chemistry 2' WHERE id = 298;

-- id 299: Topic7_Rates_and_Energy_Changes_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 7: Rates and energy changes' WHERE id = 299;

-- id 300: Topic6_Groups_in_the_Periodic_Table_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 6: Periodic table groups' WHERE id = 300;

-- id 301: Topic5_Separate_Chemistry_1_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 5: Separate chemistry 1' WHERE id = 301;

-- id 302: Topic4_Extracting_Metals_and_Equilibria_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 4: Extracting metals' WHERE id = 302;

-- id 303: Topic3_Chemical_Changes_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 3: Chemical changes' WHERE id = 303;

-- id 304: Topic3_Chemical_Changes_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 3: Chemical changes' WHERE id = 304;

-- id 305: Topic2_States_of_Matter_and_Mixtures_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 2: States of matter' WHERE id = 305;

-- id 306: Topic9_Separate_Chemistry_2_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 9: Separate chemistry 2' WHERE id = 306;

-- id 307: Topic7_Rates_and_Energy_Changes_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 7: Rates and energy changes' WHERE id = 307;

-- id 308: Topic6_Groups_in_the_Periodic_Table_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 6: Periodic table groups' WHERE id = 308;

-- id 309: Topic5_Separate_Chemistry_1_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 5: Separate chemistry 1' WHERE id = 309;

-- id 310: Topic4_Extracting_Metals_and_Equilibria_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 4: Extracting metals' WHERE id = 310;

-- id 311: Topic3_Chemical_Changes_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 3: Chemical changes' WHERE id = 311;

-- id 312: Topic3_Chemical_Changes_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 3: Chemical changes' WHERE id = 312;

-- id 313: Topic2_States_of_Matter_and_Mixtures_Worksheet
UPDATE resources SET exam_board = 'Edexcel', title = 'Edexcel GCSE Chemistry Topic 2: States of matter' WHERE id = 313;

-- id 370: T-Level_Core_Chemistry_A10-A15_12ce346d
UPDATE resources SET title = 'T-Level Science Core Chemistry (A10–A15)' WHERE id = 370;

-- id 371: T-Level_Core_Chemistry_A10-A15_c2ce94d4 (81)
UPDATE resources SET title = 'T-Level Science Core Chemistry (A10–A15)' WHERE id = 371;

-- id 372: T-Level_Core_Chemistry_A10-A15_c2ce94d4 (74)
UPDATE resources SET title = 'T-Level Science Core Chemistry (A10–A15)' WHERE id = 372;

-- id 373: TLevel_Chemistry_Worksheets_A10-A15
UPDATE resources SET title = 'T-Level Science Core Chemistry worksheets (A10–A15)' WHERE id = 373;

-- id 387: Topic 5 Formulae, Equations and Amounts of Substance 2
UPDATE resources SET title = 'Chemistry: Topic 5 Formulae, Equations and Amounts of Substance 2' WHERE id = 387;

-- id 388: Topic 4 Elements of Group 1
UPDATE resources SET title = 'Chemistry: Topic 4 Elements of Group 1' WHERE id = 388;

-- id 389: Topic 3 Redox
UPDATE resources SET title = 'Chemistry: Topic 3 Redox' WHERE id = 389;

-- id 392: Topic 5 Formulae, Equations and Amounts of Substance 2
UPDATE resources SET title = 'Chemistry: Topic 5 Formulae, Equations and Amounts of Substance 2' WHERE id = 392;

-- id 393: Topic 4 Elements of Group 1
UPDATE resources SET title = 'Chemistry: Topic 4 Elements of Group 1' WHERE id = 393;

-- id 394: Topic 3 Redox
UPDATE resources SET title = 'Chemistry: Topic 3 Redox' WHERE id = 394;

-- id 395: Topic 2 Bonding and Structure complete
UPDATE resources SET title = 'Chemistry: Topic 2 Bonding and Structure Complete' WHERE id = 395;

-- id 397: JDScience_Energetics (1)
UPDATE resources SET title = 'JDScience Chemistry: Energetics' WHERE id = 397;

-- id 398: JDScience_2.12_Mass_Spectra_and_IR
UPDATE resources SET title = 'JDScience Chemistry: 2.12 Mass Spectra and Ir' WHERE id = 398;

-- id 399: JDScience_10_Chemical_Equilibrium_1
UPDATE resources SET title = 'JDScience Chemistry: 10 Chemical Equilibrium 1' WHERE id = 399;

-- id 400: JDScience_4.5_Further_Equilibrium_
UPDATE resources SET title = 'JDScience Chemistry: 4.5 Further Equilibrium' WHERE id = 400;

-- id 401: JDScience_Reaction_Rate,_Collision_Theory_and_Activationn_Energy
UPDATE resources SET title = 'JDScience Chemistry: Reaction Rate, Collision Theory and Activationn Energy' WHERE id = 401;

-- id 402: JDScience_Energetics (1)
UPDATE resources SET title = 'JDScience Chemistry: Energetics' WHERE id = 402;

-- id 403: JDScience_2.12_Mass_Spectra_and_IR
UPDATE resources SET title = 'JDScience Chemistry: 2.12 Mass Spectra and Ir' WHERE id = 403;

-- id 404: JDScience_10_Chemical_Equilibrium_1
UPDATE resources SET title = 'JDScience Chemistry: 10 Chemical Equilibrium 1' WHERE id = 404;

-- id 406: JDScience_Reaction_Rate,_Collision_Theory_and_Activationn_Energy
UPDATE resources SET title = 'JDScience Chemistry: Reaction Rate, Collision Theory and Activationn Energy' WHERE id = 406;

-- id 405: JDScience_4.5_Further_Equilibrium_
UPDATE resources SET title = 'JDScience Chemistry: 4.5 Further Equilibrium' WHERE id = 405;

-- id 407: JDScience_Energetics (1)
UPDATE resources SET title = 'JDScience Chemistry: Energetics' WHERE id = 407;

-- id 408: JDScience_2.12_Mass_Spectra_and_IR
UPDATE resources SET title = 'JDScience Chemistry: 2.12 Mass Spectra and Ir' WHERE id = 408;

-- id 409: JDScience_10_Chemical_Equilibrium_1
UPDATE resources SET title = 'JDScience Chemistry: 10 Chemical Equilibrium 1' WHERE id = 409;

-- id 410: JDScience_4.5_Further_Equilibrium_
UPDATE resources SET title = 'JDScience Chemistry: 4.5 Further Equilibrium' WHERE id = 410;

-- id 411: JDScience_Reaction_Rate,_Collision_Theory_and_Activationn_Energy
UPDATE resources SET title = 'JDScience Chemistry: Reaction Rate, Collision Theory and Activationn Energy' WHERE id = 411;

-- id 413: JDScience_Energetics (1)
UPDATE resources SET title = 'JDScience Chemistry: Energetics' WHERE id = 413;

-- id 414: JDScience_2.12_Mass_Spectra_and_IR
UPDATE resources SET title = 'JDScience Chemistry: 2.12 Mass Spectra and Ir' WHERE id = 414;

-- id 415: JDScience_10_Chemical_Equilibrium_1
UPDATE resources SET title = 'JDScience Chemistry: 10 Chemical Equilibrium 1' WHERE id = 415;

-- id 416: JDScience_4.5_Further_Equilibrium_
UPDATE resources SET title = 'JDScience Chemistry: 4.5 Further Equilibrium' WHERE id = 416;

-- id 417: JDScience_Reaction_Rate,_Collision_Theory_and_Activationn_Energy
UPDATE resources SET title = 'JDScience Chemistry: Reaction Rate, Collision Theory and Activationn Energy' WHERE id = 417;

-- id 419: jdscience_worksheet_mass_spectra_ir
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Mass Spectra Ir' WHERE id = 419;

-- id 420: jdscience_worksheet_energetics
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Energetics' WHERE id = 420;

-- id 421: jdscience_worksheet_reaction_rates_collision_theory
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Reaction Rates Collision Theory' WHERE id = 421;

-- id 422: jdscience_worksheet_chemical_equilibrium_1
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Chemical Equilibrium 1' WHERE id = 422;

-- id 423: jdscience_worksheet_further_equilibrium
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Further Equilibrium' WHERE id = 423;

-- id 424: jdscience_worksheet_topic1_key_concepts
UPDATE resources SET level = 'GCSE/IGCSE', exam_board = 'Edexcel', title = 'JDScience worksheet — Edexcel GCSE Chemistry Topic 1: Key concepts' WHERE id = 424;

-- id 425: jdscience_worksheet_topic1_key_concepts
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience worksheet — Edexcel GCSE Chemistry Topic 1: Key concepts' WHERE id = 425;

-- id 426: jdscience_worksheet_mass_spectra_ir
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Mass Spectra Ir' WHERE id = 426;

-- id 427: jdscience_worksheet_energetics
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Energetics' WHERE id = 427;

-- id 428: jdscience_worksheet_reaction_rates_collision_theory
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Reaction Rates Collision Theory' WHERE id = 428;

-- id 429: jdscience_worksheet_chemical_equilibrium_1
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Chemical Equilibrium 1' WHERE id = 429;

-- id 430: jdscience_worksheet_further_equilibrium
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Further Equilibrium' WHERE id = 430;

-- id 431: JDScience_Energetics (1)
UPDATE resources SET title = 'JDScience worksheet — Chemistry: Energetics' WHERE id = 431;

-- id 432: jdscience_worksheet_topic4_extracting_metals_equilibria
UPDATE resources SET level = 'GCSE/IGCSE', exam_board = 'Edexcel', title = 'JDScience worksheet — Edexcel GCSE Chemistry Topic 4: Extracting metals' WHERE id = 432;

-- id 433: jdscience_worksheet_topic3_chemical_changes
UPDATE resources SET level = 'GCSE/IGCSE', exam_board = 'Edexcel', title = 'JDScience worksheet — Edexcel GCSE Chemistry Topic 3: Chemical changes' WHERE id = 433;

-- id 434: jdscience_worksheet_topic5_separate_chemistry_1
UPDATE resources SET level = 'GCSE/IGCSE', exam_board = 'Edexcel', title = 'JDScience worksheet — Edexcel GCSE Chemistry Topic 5: Separate chemistry 1' WHERE id = 434;

-- id 435: jdscience_worksheet_topic5_separate_chemistry_1
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience worksheet — Edexcel GCSE Chemistry Topic 5: Separate chemistry 1' WHERE id = 435;

-- id 436: jdscience_worksheet_topic4_extracting_metals_equilibria
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience worksheet — Edexcel GCSE Chemistry Topic 4: Extracting metals' WHERE id = 436;

-- id 437: jdscience_worksheet_topic3_chemical_changes
UPDATE resources SET level = 'GCSE/IGCSE', title = 'JDScience worksheet — Edexcel GCSE Chemistry Topic 3: Chemical changes' WHERE id = 437;

COMMIT;
