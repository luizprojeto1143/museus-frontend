import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { api } from "../../../api/client";
import { useTerminology } from "../../../hooks/useTerminology";
import { 
  type LucideIcon,
  LayoutDashboard, 
  Image, 
  Map as MapIcon, 
  Tag, 
  FolderOpen, 
  Theater, 
  QrCode, 
  Ticket, 
  Smartphone, 
  Building2, 
  Calendar, 
  GraduationCap, 
  Users, 
  Star, 
  ShoppingCart, 
  Compass, 
  Trophy, 
  Sword, 
  ClipboardList, 
  Palette, 
  HardHat, 
  Handshake, 
  Accessibility, 
  BarChart, 
  Armchair, 
  Users2, 
  BookOpen, 
  Zap, 
  Diamond, 
  Bot, 
  Eye, 
  MapPin, 
  Bell, 
  CircleDollarSign, 
  Settings, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  Smile, 
  Flame, 
  Filter, 
  ShieldCheck, 
  Baby, 
  Wrench, 
  Target, 
  Scroll, 
  CalendarDays, 
  FileSearch, 
  Wand2, 
  Camera, 
  Globe, 
  History, 
  Inbox, 
  TreePine,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useIsCityMode } from "../../auth/TenantContext";
import { GOLIVE_ADMIN_KEEP } from "@/config/golive";
