/** Segment de doublage calé sur la timeline vidéo (secondes). */
export type VideoDubFrSegmentDef = {
  /** Instant dans la vidéo où l’audio de ce segment démarre. */
  atSec: number;
  /** Texte lu par edge-tts pour ce passage. */
  script: string;
};

/** Fichiers MP3 servis depuis web/public/media/dubs/ */
export type VideoDubFrEntry = {
  /** Préfixe des fichiers, ex. jamf-smart-groups-policies-fr */
  basename: string;
  segments: VideoDubFrSegmentDef[];
};

export type VideoDubFrSyncSegment = {
  atSec: number;
  url: string;
  durationSec: number;
};

export type VideoDubFrSyncManifest = {
  basename: string;
  segments: VideoDubFrSyncSegment[];
};

export const VIDEO_DUB_FR_BY_MODULE: Record<string, Record<string, VideoDubFrEntry>> = {
  'jamf-pro-foundations': {
    'enrollment-apple-integration': {
      basename: 'jamf-enrollment-apple-integration-fr',
      segments: [
        {
          atSec: 24,
          script:
            "Cette leçon couvre l'intégration de Jamf Pro avec Apple Business Manager pour l'enrôlement automatisé des appareils.",
        },
        {
          atSec: 70,
          script:
            "Étape un, prérequis. Vous devez disposer d'un compte Apple Business Manager actif sur business.apple.com.",
        },
        {
          atSec: 101,
          script:
            'Étape deux, clé publique Jamf. Dans Jamf Pro, ouvrez Paramètres, Global, Enrôlement automatisé des appareils. Téléchargez la clé publique. Ce certificat prouve à Apple que Jamf Pro est un serveur MDM de confiance.',
        },
        {
          atSec: 149,
          script:
            'Étape trois, serveur MDM dans Apple Business Manager. Connectez-vous à ABM, Préférences, Ajouter un serveur MDM. Importez la clé publique, nommez le serveur, puis téléchargez le jeton serveur au format p7m.',
        },
        {
          atSec: 200,
          script:
            "Étape quatre, jeton dans Jamf Pro. Uploadez le jeton. Jamf synchronise la liste des appareils éligibles à l'enrôlement automatisé.",
        },
        {
          atSec: 361,
          script:
            "Étape cinq, PreStage Enrollment. Créez un profil PreStage : supervision, verrouillage MDM, options de l'assistant de configuration, et gestion Activation Lock au niveau organisation.",
        },
        {
          atSec: 652,
          script:
            "Étape six, assignation et déploiement. Assignez les appareils au serveur MDM Jamf dans ABM. Au premier allumage, l'assistant de configuration inscrit automatiquement l'appareil en mode supervisé.",
        },
      ],
    },
  },
  'intune-ios-enrollment': {
    'ade-enrollment-basics': {
      basename: 'intune-ade-enrollment-basics-fr',
      segments: [
        {
          atSec: 0,
          script:
            "Cette leçon explique comment configurer l'enrôlement automatisé Apple, ADE, dans Microsoft Intune avec Apple Business Manager.",
        },
        {
          atSec: 14,
          script:
            'Étape un, certificat Push Apple MDM dans Intune. Téléchargez la demande de signature, obtenez le certificat auprès du portail Apple Push Certificates, puis importez-le dans Intune.',
        },
        {
          atSec: 134,
          script:
            "Étape deux, connecter Intune à Apple Business Manager. Téléchargez la clé publique Intune, créez le serveur MDM dans ABM, récupérez le jeton serveur p7m et uploadez-le dans le programme d'enrôlement Intune.",
        },
        {
          atSec: 377,
          script:
            'Étape quatre, assigner les appareils dans ABM au serveur Microsoft Intune.',
        },
        {
          atSec: 528,
          script:
            "Étape trois, créer un profil d'inscription ADE. Définissez la supervision, le verrouillage MDM, et les écrans de l'assistant de configuration à afficher ou masquer.",
        },
        {
          atSec: 650,
          script:
            "Au premier allumage, l'iPad ou l'iPhone affiche Remote Management et s'inscrit automatiquement dans Intune avec l'état Managed.",
        },
      ],
    },
  },
};

export function getModuleVideoDubFr(
  courseSlug: string,
  moduleSlug: string
): VideoDubFrEntry | undefined {
  return VIDEO_DUB_FR_BY_MODULE[courseSlug]?.[moduleSlug];
}

export function getModuleVideoDubFrSyncUrl(entry: VideoDubFrEntry): string {
  return `/media/dubs/${entry.basename}-sync.json`;
}

export function listVideoDubFrEntries(): Array<
  VideoDubFrEntry & { courseSlug: string; moduleSlug: string }
> {
  const entries: Array<VideoDubFrEntry & { courseSlug: string; moduleSlug: string }> = [];
  for (const [courseSlug, modules] of Object.entries(VIDEO_DUB_FR_BY_MODULE)) {
    for (const [moduleSlug, entry] of Object.entries(modules)) {
      entries.push({ courseSlug, moduleSlug, ...entry });
    }
  }
  return entries;
}

/** Trouve le segment actif et la fin de sa fenêtre vidéo. */
export function resolveVideoDubSegmentAt(
  segments: VideoDubFrSyncSegment[],
  videoTimeSec: number
): { index: number; segment: VideoDubFrSyncSegment; windowEndSec: number } | null {
  if (!segments.length || videoTimeSec < segments[0].atSec) {
    return null;
  }

  let index = 0;
  for (let i = 0; i < segments.length; i += 1) {
    if (segments[i].atSec <= videoTimeSec) {
      index = i;
    } else {
      break;
    }
  }

  const segment = segments[index];
  const windowEndSec = segments[index + 1]?.atSec ?? Number.POSITIVE_INFINITY;
  return { index, segment, windowEndSec };
}

/** Ajuste la vitesse de lecture pour remplir la fenêtre vidéo du segment. */
export function computeVideoDubPlaybackRate(
  segmentDurationSec: number,
  windowDurationSec: number
): number {
  if (!Number.isFinite(windowDurationSec) || windowDurationSec <= 0) {
    return 1;
  }
  const raw = segmentDurationSec / windowDurationSec;
  return Math.min(1.25, Math.max(0.82, raw));
}
