import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useMembership } from "../../hooks/useMembership";
import { router } from "expo-router";
import {
  ShareIcon,
  QrCodeIcon,
  ArrowPathIcon,
} from "react-native-heroicons/outline";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import { useRef } from "react";
import Barcode from "react-native-barcode-qr-generator";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MembershipCardScreen() {
  const { membership, isLoading, refetch } = useMembership();
  const cardRef = useRef<ViewShot>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "---"
      : date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  const barcodeValue = membership?.digital_card?.barcode_data || "";
  const hasValidBarcode = barcodeValue.length > 0;

  const handleShare = async () => {
    if (!cardRef.current?.capture) return;
    try {
      const uri = await cardRef.current.capture();
      if (!uri) return;
      await Sharing.shareAsync(uri, { dialogTitle: "Share Membership Card" });
    } catch {
      Alert.alert("Error", "Could not share membership card");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F5F5F0] justify-center items-center">
        <ActivityIndicator size="large" color="#1A3C2E" />
      </View>
    );
  }

  if (!membership?.is_active) {
    return (
      <View className="flex-1 bg-[#F5F5F0] justify-center items-center px-8">
        <View className="w-20 h-20 bg-[#E8F0E9] rounded-full items-center justify-center mb-5">
          <QrCodeIcon size={36} color="#1A3C2E" />
        </View>
        <Text className="text-[#1A3C2E] text-xl font-bold mb-2 text-center">
          Membership Expired
        </Text>
        <Text className="text-gray-400 text-sm text-center leading-relaxed mb-8">
          Your membership has expired. Renew to access your digital card and
          member benefits.
        </Text>
        <TouchableOpacity
          className="bg-[#1A3C2E] px-8 py-3.5 rounded-2xl"
          onPress={() => router.push("/membership/renew")}
        >
          <Text className="text-white font-semibold text-sm">
            Renew Membership
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#F5F5F0]"
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView className="flex-1 px-5 pt-4 pb-10">
        {/* Page label */}
        <Text className="text-[#9CA3AF] text-xl tracking-widest uppercase font-medium mb-4 ml-0.5">
          Membership Card
        </Text>

        {/* Card */}
        <ViewShot ref={cardRef} options={{ format: "png", quality: 0.9 }}>
          <View
            style={{
              backgroundColor: "#1A3C2E",
              borderRadius: 20,
              padding: 24,
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <View
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -20,
                left: -20,
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            />

            {/* Top row: name + tier */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  AZIKE Community
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: 22,
                    fontWeight: "700",
                    letterSpacing: -0.3,
                  }}
                >
                  {membership?.digital_card?.member_name || "Member"}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 6,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.12)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {membership?.membership_tier || "Standard"}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "rgba(134,239,172,0.2)",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      color: "#86efac",
                      fontSize: 10,
                      fontWeight: "600",
                    }}
                  >
                    ● Active
                  </Text>
                </View>
              </View>
            </View>

            {/* Member ID */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Member ID
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 16,
                  fontFamily: "monospace",
                  letterSpacing: 3,
                }}
              >
                {membership?.digital_card?.member_id || "---"}
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255,255,255,0.08)",
                marginBottom: 20,
              }}
            />

            {/* Barcode */}
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                minHeight: 110,
                justifyContent: "center",
              }}
            >
              {hasValidBarcode ? (
                <Barcode
                  value={barcodeValue}
                  type="barcode"
                  format="CODE128"
                  maxWidth={260}
                  height={65}
                  lineColor="#1A3C2E"
                  background="#ffffff"
                  text={barcodeValue.slice(0, 30)}
                  textStyle={{
                    fontSize: 10,
                    color: "#9CA3AF",
                    marginTop: 8,
                    fontFamily: "monospace",
                  }}
                />
              ) : (
                <ActivityIndicator size="small" color="#1A3C2E" />
              )}
            </View>

            {/* Dates */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 10,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  Since
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  {formatDate(membership?.digital_card?.member_since)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 10,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  Expires
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  {formatDate(membership?.current_period?.end_date)}
                </Text>
              </View>
            </View>
          </View>
        </ViewShot>

        {/* Actions */}
        <View className="flex-row justify-center gap-3 mt-5">
          <TouchableOpacity
            className="flex-1 bg-white flex-row items-center justify-center py-3.5 rounded-2xl"
            style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.08)" }}
            onPress={handleShare}
          >
            <ShareIcon size={17} color="#1A3C2E" />
            <Text className="text-[#1A3C2E] ml-2 text-sm font-medium">
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white flex-row items-center justify-center py-3.5 rounded-2xl"
            style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.08)" }}
            onPress={() => refetch()}
          >
            <ArrowPathIcon size={17} color="#1A3C2E" />
            <Text className="text-[#1A3C2E] ml-2 text-sm font-medium">
              Refresh
            </Text>
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View className="mt-8">
          <Text className="text-[#9CA3AF] text-xs tracking-widest uppercase font-medium mb-3 ml-0.5">
            Your Benefits
          </Text>
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" }}
          >
            <BenefitItem
              title="Free Events Remaining"
              value={`${membership?.entitlements?.free_events_remaining || 0} / ${membership?.entitlements?.free_events_limit || 1}`}
            />
            <BenefitItem title="Member Discount" value="Up to 70% off" />
            <BenefitItem title="Exclusive Access" value="Member-only events" />
            <BenefitItem
              title="Auto-Renewal"
              value={membership?.auto_renew_enabled ? "On" : "Off"}
              action
              onPress={() => router.push("/membership/settings")}
              last
            />
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

function BenefitItem({
  title,
  value,
  action,
  onPress,
  last,
}: {
  title: string;
  value: string;
  action?: boolean;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 0.5,
        borderColor: "rgba(0,0,0,0.06)",
      }}
      onPress={onPress}
      disabled={!action}
      activeOpacity={action ? 0.6 : 1}
    >
      <Text style={{ color: "#4B5563", fontSize: 14 }}>{title}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ color: "#1A3C2E", fontSize: 13, fontWeight: "600" }}>
          {value}
        </Text>
        {action && <Text style={{ color: "#9CA3AF", fontSize: 16 }}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}
