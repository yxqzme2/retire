# RetireVision — Unraid Deployment Guide

Two ways to get it onto your Unraid server. Pick the one that fits you.

---

## Method A — Docker Hub (easiest for future updates)

You build once on your PC, push to your Docker Hub account, and Unraid pulls from there.

### Step 1 — Build on your PC

Open PowerShell in the project root and run:

```powershell
.\deploy\build.ps1 -Registry yourDockerHubUsername
```

### Step 2 — Log in to Docker Hub and push

```powershell
docker login
.\deploy\push-to-dockerhub.ps1 -Username yourDockerHubUsername
```

### Step 3 — Create a custom Docker network on Unraid

SSH into Unraid and run once:

```bash
docker network create retirevision
```

### Step 4 — Add the containers in Unraid

**Option 4a — Compose Manager (recommended)**

1. Install the **Compose Manager** plugin from Community Applications if you haven't already.
2. Copy `docker-compose.unraid.yml` from this project to Unraid:
   ```powershell
   # From your PC:
   scp "H:\retire - claude\docker-compose.unraid.yml" root@192.168.1.x:/mnt/user/appdata/retirevision/docker-compose.yml
   ```
3. In Unraid → Docker → Compose → point it at `/mnt/user/appdata/retirevision/docker-compose.yml`.
4. Set `DOCKER_REGISTRY=yourDockerHubUsername` in the compose environment, then click **Up**.

**Option 4b — CA Templates (individual containers)**

1. In Unraid → Docker → **Add Container**.
2. For the backend: paste the contents of `deploy/unraid/retirevision-backend.xml`, update the Repository field to `yourDockerHubUsername/retirevision-backend:latest`.
3. Add the frontend the same way using `deploy/unraid/retirevision-frontend.xml`.
4. Start the backend first, then the frontend.

---

## Method B — Direct SSH Deploy (no Docker Hub required)

Everything stays local. Images are built on your PC, exported as `.tar` files, and loaded directly onto Unraid over SSH.

### Prerequisites

- SSH must be enabled on Unraid (Settings → Management Access → SSH)
- OpenSSH client on your Windows PC (built into Windows 10+)

### One-command deploy

```powershell
# Build + export + SCP + load on Unraid — all in one:
.\deploy\build.ps1
.\deploy\export-images.ps1 -Deploy -UnraidIP 192.168.1.x -UnraidUser root
```

This will:
1. Save both images as `.tar` files to `deploy\images\`
2. SCP them to `/tmp/retirevision-images/` on Unraid
3. Run `docker load` on Unraid
4. Clean up the temp files

### Then start the stack on Unraid

```bash
# SSH into Unraid:
mkdir -p /mnt/user/appdata/retirevision/db
mkdir -p /mnt/user/appdata/retirevision/uploads
docker network create retirevision 2>/dev/null || true
```

Copy `docker-compose.unraid.yml` to Unraid (from your PC):
```powershell
scp "H:\retire - claude\docker-compose.unraid.yml" root@192.168.1.x:/mnt/user/appdata/retirevision/docker-compose.yml
```

Start it:
```bash
cd /mnt/user/appdata/retirevision
DOCKER_REGISTRY=retirevision docker compose up -d
```

---

## Accessing the Dashboard

Once running, open a browser to:

```
http://YOUR_UNRAID_IP:7410
```

The API Swagger docs are at:
```
http://YOUR_UNRAID_IP:8000/docs
```

---

## Volume Layout on Unraid

```
/mnt/user/appdata/retirevision/
├── db/
│   └── retire.db          ← SQLite database (back this up!)
├── uploads/               ← CSV import files
└── docker-compose.yml     ← Your compose file
```

---

## Backing Up Your Data

The only file that matters is `retire.db`. Copy it off Unraid to keep your scenarios safe:

```bash
# On Unraid, or via your Unraid backup solution:
cp /mnt/user/appdata/retirevision/db/retire.db /mnt/user/backups/retire-$(date +%Y%m%d).db
```

Or add it to your Unraid **Appdata Backup** plugin schedule.

---

## Updating to a New Version

```powershell
# On your PC: rebuild and push/deploy
.\deploy\build.ps1
.\deploy\push-to-dockerhub.ps1 -Username yourname          # Method A
# OR
.\deploy\export-images.ps1 -Deploy -UnraidIP 192.168.1.x   # Method B

# On Unraid: pull new images and restart
cd /mnt/user/appdata/retirevision
docker compose pull    # Method A only
docker compose up -d
```

---

## Port Reference

| Port | Service | Default |
|------|---------|---------|
| 7410 | Web UI (frontend) | changeable in template |
| 8000 | Backend API | internal only, or expose for Swagger |

---

## Troubleshooting

**Frontend shows blank page or "cannot connect to API"**
- Make sure both containers are on the `retirevision` Docker network
- Check the backend is healthy: `docker logs retirevision-backend`

**"No such image" on Unraid**
- Re-run the export + deploy script, or `docker pull` from Docker Hub

**Database is empty after restart**
- The `/data` volume must map to a persistent Unraid path (not `/tmp`)
- Check your compose volume mapping points to `/mnt/user/appdata/retirevision/db`
