import React from 'react';
import { Document, Page }  from 'react-pdf';


export default function HelpBrainRegion() {
  return (
    <div style={{margin: '1em'}} >
      <Document file="/public/brainregions.pdf">
        <Page pageNumber={1} scale={1.5}/>
      </Document>
    </div>
  );
}


  /*
    <Grid container spacing={24}>
      <Grid item sm={6}>
        <h3>SNP - Superior Neuropils</h3>
          <SLP(R) - Superior Lateral Protocerebrum
  SIP(R/L) - Superior Intermediate Protocerebrum
  SMP(R/L) - Superior Medial Protocerebrum

OL - Optic Lobe
  ME(R) - Medulla
  AME(R) - Accessory Medulla
  LO(R) - Lobula
  LOP(R) - Lobula Plate

INP - Inferior Neuropils
  CRE(R/L) - Crepine
  ROB(R) - Round Body
  SCL(R/L) - Superior Clamp
  ICL(R/L) - Inferior Clamp
  IB - Inferior Bridge
  ATL(R/L) - Antler

MB - Mushroom Body (L/R/+ACA)
  CA(R/L) - Calyx
    lACA(R) - Lateral Accessory Calyx
  dACA(R) - Dorsal Accessory Calyx
  vACA(R) - Ventral Accessory Calyx
  PED(R) - Pedunculus
    Vertical Lobe (VL)
      aL(R/L) - Alpha Lobe
      a'L(R/L) - Alpha Prime Lobe
    Medial Lobe (ML)
      bL(R/L) - Beta Lobei
      b'L(R/L) - Beta Prime Lobe
      gL(R/L) - Gamma Lobe

AL - Antennal Lobe (L/R)

LX - Lateral Complex
  BU(R/L) - Bulb
  LAL(R/L) - Lateral Accessory Lobe
  GA(R) - Gall

CX - Central Complex
  Central Body
    FB - Fan Shaped Body
    AB(R/L) - Asymmetric Body
    EB - Epsilloid Body (no link)
  PB - Protocerebral Bridge
  NO - Noduli

VMNP - Ventromedial Neuropils
  VES(R/L) - Vest
  EPA(R/L) - Epaulette
  GOR(R/L) - Gorget
  SPS(R/L) - Superior Posterior Slope
  IPS - Inferior Posterior Slope

LH(R) - Lateral Horn

PENP - Periesophageal Neuropils
  SAD - Saddle
  AMMC - Antennal Mechanosensory and Motor Center
  FLA(R) - Flange
  CAN(R) - Cantle
  PRW - Prow

VLNP - Ventrolateral Neuropils
  AOTU(R) - Anterior Optic Tubercle
  AVLP(R) - Anterior Ventrolateral Protocerebrum
  PVLP(R) - Posterior Ventrolateral Protocerebrum
  PLP(R) - Posteriorlateral Protocerebrum
  WED(R) - Wedge

GNG - Gnathal Ganglia
</Grid>
  );
} */
